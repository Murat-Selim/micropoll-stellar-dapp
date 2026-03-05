'use client';

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Client, networks, Poll as ContractPoll } from '@/contracts/micro_poll/src';
import type { SignTransactionOptions, SignTransactionResponse } from 'stellar-wallet-kit';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || networks.testnet.contractId;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org';

export interface Poll {
  id: number;
  creator: string;
  question: string;
  options: string[];
  votes: number[];
  reward_pool: number;
  deadline: number;
  is_closed: boolean;
  voter_count: number;
}

// Convert contract Poll to our Poll interface
function contractPollToPoll(contractPoll: ContractPoll, id: number): Poll {
  return {
    id,
    creator: contractPoll.creator,
    question: contractPoll.question,
    options: contractPoll.options,
    votes: contractPoll.votes.map(v => Number(v)),
    reward_pool: Number(contractPoll.reward_pool) / 10_000_000, // Convert from stroops
    deadline: Number(contractPoll.deadline) * 1000, // Convert seconds to ms
    is_closed: contractPoll.is_closed,
    voter_count: Number(contractPoll.voter_count),
  };
}

export class PollService {
  private address: string = '';
  private walletSignTx: ((xdr: string, options?: SignTransactionOptions) => Promise<SignTransactionResponse>) | null = null;
  // @ts-ignore - SDK typing issues
  private client: Client;

  constructor() {
    this.client = new Client({
      contractId: CONTRACT_ID,
      rpcUrl: RPC_URL,
      networkPassphrase: networks.testnet.networkPassphrase,
    });
  }

  setWalletKit(walletKit: unknown, address: string) {
    this.address = address;
    // Extract signTransaction method from wallet kit
    if (walletKit && typeof walletKit === 'object' && 'signTransaction' in walletKit) {
      const kit = walletKit as { signTransaction: (xdr: string, options?: SignTransactionOptions) => Promise<SignTransactionResponse> };
      this.walletSignTx = kit.signTransaction.bind(kit);
    }
  }

  setAddress(address: string) {
    this.address = address;
  }

  // Use a generic type that accepts any signAndSend argument structure
  private async signAndSend<T = unknown>(tx: { signAndSend: (options: T) => Promise<unknown> }): Promise<{ hash: string; result?: unknown }> {
    if (!this.walletSignTx) {
      throw new Error('Cüzdan bağlı değil. Lütfen cüzdanınızı bağlayın.');
    }

    // @ts-ignore - SDK typing issues
    const result = await tx.signAndSend({
      signTransaction: async (xdr: string): Promise<string> => {
        const signed = await this.walletSignTx!(xdr, {
          networkPassphrase: networks.testnet.networkPassphrase,
        });
        return signed.signedTxXdr;
      },
    });

    return { hash: (result as { hash: string }).hash, result: (result as { result?: unknown }).result };
  }

  async createPoll(
    question: string,
    options: string[],
    rewardXLM: number,
    durationSeconds: number
  ): Promise<{ pollId: number; txHash: string }> {
    // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
    const rewardStroops = BigInt(Math.floor(rewardXLM * 10_000_000));

    try {
      // Build the transaction
      // @ts-ignore - SDK typing issues
      const tx = await this.client.create_poll({
        creator: this.address,
        question,
        pollOptions: options,
        reward_pool: rewardStroops,
        duration_seconds: BigInt(durationSeconds),
      });

      const result = await this.signAndSend(tx);

      console.log('[MicroPoll] Poll created:', result.hash);

      // Get the new poll ID
      const pollCount = await this.getPollCount();

      return { pollId: Number(pollCount) - 1, txHash: result.hash };
    } catch (error) {
      console.error('[MicroPoll] Create poll error:', error);
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('user rejected') || msg.includes('rejected')) {
          throw new Error('İşlem iptal edildi');
        }
      }
      throw error;
    }
  }

  async vote(pollId: number, optionIndex: number): Promise<string> {
    try {
      // @ts-ignore - SDK typing issues
      const tx = await this.client.vote({
        user: this.address,
        poll_id: BigInt(pollId),
        option_index: optionIndex,
      });

      const result = await this.signAndSend(tx);

      console.log('[MicroPoll] Vote cast:', result.hash);
      return result.hash;
    } catch (error) {
      console.error('[MicroPoll] Vote error:', error);
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already voted') || msg.includes('5')) {
          throw new Error('Bu ankete zaten oy verdiniz');
        }
        if (msg.includes('user rejected') || msg.includes('rejected')) {
          throw new Error('İşlem iptal edildi');
        }
        if (msg.includes('closed') || msg.includes('3')) {
          throw new Error('Anket kapanmış, oy veremezsiniz');
        }
        if (msg.includes('deadline') || msg.includes('4')) {
          throw new Error('Anket süresi dolmuş');
        }
      }
      throw error;
    }
  }

  async closePoll(pollId: number): Promise<string> {
    try {
      // @ts-ignore - SDK typing issues
      const tx = await this.client.close_poll({
        caller: this.address,
        poll_id: BigInt(pollId),
      });

      const result = await this.signAndSend(tx);

      console.log('[MicroPoll] Poll closed:', result.hash);
      return result.hash;
    } catch (error) {
      console.error('[MicroPoll] Close poll error:', error);
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('user rejected') || msg.includes('rejected')) {
          throw new Error('İşlem iptal edildi');
        }
      }
      throw error;
    }
  }

  async claimReward(pollId: number): Promise<{ amount: number; txHash: string }> {
    try {
      // @ts-ignore - SDK typing issues
      const tx = await this.client.claim_reward({
        user: this.address,
        poll_id: BigInt(pollId),
      });

      const result = await this.signAndSend(tx);

      console.log('[MicroPoll] Reward claimed:', result.hash);
      
      return { amount: Number(result.result || 0) / 10_000_000, txHash: result.hash };
    } catch (error) {
      console.error('[MicroPoll] Claim reward error:', error);
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already claimed') || msg.includes('9')) {
          throw new Error('Ödülü zaten aldınız');
        }
        if (msg.includes('not voted') || msg.includes('5')) {
          throw new Error('Bu ankete oy vermediniz');
        }
        if (msg.includes('not closed') || msg.includes('3')) {
          throw new Error('Anket henüz kapanmamış');
        }
        if (msg.includes('user rejected') || msg.includes('rejected')) {
          throw new Error('İşlem iptal edildi');
        }
      }
      throw error;
    }
  }

  async getPoll(pollId: number): Promise<Poll | null> {
    try {
      // @ts-ignore - SDK typing issues
      const result = await this.client.get_poll({
        poll_id: BigInt(pollId),
      });

      // For read-only calls, simulate returns the result
      // @ts-ignore - SDK typing issues
      const pollData = await result.simulate();
      
      if (!pollData) {
        return this.getMockPoll(pollId);
      }

      // @ts-ignore - SDK typing issues
      return contractPollToPoll(pollData, pollId);
    } catch (error) {
      console.error('[MicroPoll] Get poll error:', error);
      return this.getMockPoll(pollId);
    }
  }

  async getPollCount(): Promise<number> {
    try {
      // @ts-ignore - SDK typing issues
      const result = await this.client.get_poll_count();
      // @ts-ignore - SDK typing issues
      const count = await result.simulate();
      return Number(count);
    } catch (error) {
      console.error('[MicroPoll] Get poll count error:', error);
      return 3; // Return mock count
    }
  }

  async hasVoted(pollId: number): Promise<boolean> {
    if (!this.address) return false;

    try {
      // @ts-ignore - SDK typing issues
      const result = await this.client.has_voted({
        user: this.address,
        poll_id: BigInt(pollId),
      });

      // @ts-ignore - SDK typing issues
      const voted = await result.simulate();
      return Boolean(voted);
    } catch (error) {
      console.error('[MicroPoll] Has voted error:', error);
      return false;
    }
  }

  async getAllPolls(): Promise<Poll[]> {
    const count = await this.getPollCount();
    const polls: Poll[] = [];

    for (let i = 0; i < count; i++) {
      const poll = await this.getPoll(i);
      if (poll) polls.push(poll);
    }

    return polls;
  }

  // Mock data for fallback
  private getMockPoll(pollId: number): Poll | null {
    const mockPolls: Record<number, Poll> = {
      0: {
        id: 0,
        creator: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        question: 'Should Stellar add native NFT support?',
        options: ['Yes', 'No', 'Maybe later'],
        votes: [142, 89, 34],
        reward_pool: 50,
        deadline: Date.now() + 7200000,
        is_closed: false,
        voter_count: 265,
      },
      1: {
        id: 1,
        creator: 'GBH2U2W6WGJ3EJTECXA7UV7XLSHF5QSR7XVXUFDW4VZ7Y7Q6O6ZQ6T6A',
        question: 'Best consensus mechanism?',
        options: ['SCP', 'PoS', 'PoW', 'DAG'],
        votes: [201, 156, 43, 78],
        reward_pool: 120,
        deadline: Date.now() + 82800000,
        is_closed: false,
        voter_count: 478,
      },
      2: {
        id: 2,
        creator: 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOUJ3LNLRK',
        question: 'Will XLM reach $1 in 2025?',
        options: ['Yes', 'No'],
        votes: [312, 198],
        reward_pool: 200,
        deadline: Date.now() - 3600000,
        is_closed: true,
        voter_count: 510,
      },
    };
    return mockPolls[pollId] || null;
  }
}

const pollService = new PollService();

export function getPollService(): PollService {
  return pollService;
}

export function getStellarExpertUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
