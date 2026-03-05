'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getPollService, getStellarExpertUrl, type Poll } from '@/lib/pollService';

// Format deadline to readable string
function formatDeadline(deadline: number): string {
  const now = Date.now();
  const deadlineMs = deadline; // deadline is already in milliseconds from pollService
  const diff = deadlineMs - now;
  
  if (diff <= 0) return 'CLOSED';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  }
  if (hours > 0) {
    return `${hours}h remaining`;
  }
  return `${minutes}m remaining`;
}

interface PollData {
  id: number;
  question: string;
  options: string[];
  votes: number[];
  rewardPool: number;
  deadline: string;
  isClosed: boolean;
}

// Convert Poll to PollData
function pollToData(poll: Poll): PollData {
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    votes: poll.votes,
    rewardPool: poll.reward_pool,
    deadline: formatDeadline(poll.deadline),
    isClosed: poll.is_closed,
  };
}

function PollCard({ 
  poll, 
  isWalletConnected, 
  userVoted,
  onVote,
  onClaimReward,
  isSubmitting 
}: { 
  poll: PollData; 
  isWalletConnected: boolean; 
  userVoted: boolean;
  onVote: (pollId: number, optionIndex: number) => void;
  onClaimReward: (pollId: number) => void;
  isSubmitting: boolean;
}) {
  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = () => {
    if (selectedOption !== null) {
      onVote(poll.id, selectedOption);
    }
  };

  return (
    <div className="brutalist-card">
      {/* Mavi accent - ödül havuzu için */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-[#0000FF] m-2" />

      {/* Soru */}
      <h3 className="brutalist-heading text-lg mb-4 pr-8">{poll.question}</h3>

      {/* Seçenekler ve progress bar */}
      <div className="space-y-3 mb-4">
        {poll.options.map((option, index) => {
          const voteCount = poll.votes[index];
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <div key={index} className="relative">
              <div className="flex justify-between text-sm mb-1 font-bold">
                <span>{option}</span>
                <span>
                  {percentage}% ({voteCount} votes)
                </span>
              </div>
              <div className="h-6 bg-white border-[3px] border-black">
                <div
                  className="h-full bg-black"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt bilgi: ödül ve süre */}
      <div className="flex justify-between items-center text-sm font-bold mb-4 pt-2 border-t-3 border-black">
        <span className="text-[#0000FF]">{poll.rewardPool} XLM POOL</span>
        <span className={poll.isClosed ? 'text-red-600' : ''}>{poll.deadline}</span>
      </div>

      {/* Butonlar */}
      <div className="flex gap-2">
        {!poll.isClosed && !userVoted && isWalletConnected && (
          <>
            {/* Seçenek seçimi */}
            <select
              value={selectedOption ?? ''}
              onChange={(e) => setSelectedOption(Number(e.target.value))}
              className="brutalist-input flex-1"
              disabled={isSubmitting}
            >
              <option value="">Select option...</option>
              {poll.options.map((option, index) => (
                <option key={index} value={index}>{option}</option>
              ))}
            </select>
            <button
              onClick={handleVote}
              data-testid={`vote-${poll.id}`}
              disabled={!isWalletConnected || userVoted || selectedOption === null || isSubmitting}
              className="brutalist-btn"
            >
              {isSubmitting ? '...' : 'VOTE'}
            </button>
          </>
        )}

        {/* Claim reward - sadece kapalı anketlerde ve oy verildiğinde göster */}
        {poll.isClosed && userVoted && (
          <button
            onClick={() => onClaimReward(poll.id)}
            data-testid={`claim-${poll.id}`}
            disabled={!isWalletConnected || isSubmitting}
            className="flex-1 brutalist-btn"
          >
            {isSubmitting ? '...' : 'CLAIM REWARD'}
          </button>
        )}

        {/* Oy verildi ama kapalı değil - buton disabled */}
        {!poll.isClosed && userVoted && (
          <button
            disabled
            className="flex-1 brutalist-btn opacity-50"
          >
            VOTED
          </button>
        )}

        {/* Cüzdan bağlı değil */}
        {!isWalletConnected && !poll.isClosed && (
          <button
            disabled
            className="flex-1 brutalist-btn opacity-50"
          >
            CONNECT WALLET
          </button>
        )}
      </div>
    </div>
  );
}

export default function PollList() {
  // Cüzdan bağlantısı kontrolü
  const { isConnected, account } = useWallet();
  const isWalletConnected = isConnected;

  // Gerçek anket verileri
  const [polls, setPolls] = useState<PollData[]>([]);
  const [votedPolls, setVotedPolls] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Anketleri contract'tan çek
  const fetchPolls = useCallback(async () => {
    try {
      const pollService = getPollService();
      const pollCount = await pollService.getPollCount();
      
      const fetchedPolls: PollData[] = [];
      for (let i = 0; i < pollCount; i++) {
        const poll = await pollService.getPoll(i);
        if (poll) {
          fetchedPolls.push(pollToData(poll));
        }
      }
      
      setPolls(fetchedPolls);
    } catch (err) {
      console.error('[MicroPoll] Fetch polls error:', err);
      // Hata durumunda boş liste
      setPolls([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kullanıcının oy verdiği anketleri kontrol et
  const fetchUserVotes = useCallback(async () => {
    if (!account?.publicKey) return;
    
    try {
      const pollService = getPollService();
      const voted: number[] = [];
      
      for (const poll of polls) {
        const hasVoted = await pollService.hasVoted(poll.id);
        if (hasVoted) {
          voted.push(poll.id);
        }
      }
      
      setVotedPolls(voted);
    } catch (err) {
      console.error('[MicroPoll] Fetch user votes error:', err);
    }
  }, [account?.publicKey, polls]);

  // İlk yükleme ve periyodik güncelleme
  useEffect(() => {
    fetchPolls();
    
    // Her 5 saniyede güncelle
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  // Anketler değişince kullanıcı oylarını kontrol et
  useEffect(() => {
    if (account?.publicKey && polls.length > 0) {
      fetchUserVotes();
    }
  }, [account?.publicKey, polls.length, fetchUserVotes]);

  // Oy ver
  const handleVote = async (pollId: number, optionIndex: number) => {
    if (!account?.publicKey) return;
    
    setIsSubmitting(true);
    setError(null);
    setTxHash(null);
    
    try {
      const pollService = getPollService();
      // Wallet kit'i ayarla - useWallet'dan alınan hesap bilgisi kullanılacak
      // Not: Bu basit entegrasyon için pollService doğrudan RPC kullanıyor
      const txHashResult = await pollService.vote(pollId, optionIndex);
      setTxHash(txHashResult);
      console.log('[MicroPoll] Vote cast:', txHashResult);
      
      // Anketleri yenile
      await fetchPolls();
      await fetchUserVotes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[MicroPoll] Vote error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ödül al
  const handleClaimReward = async (pollId: number) => {
    if (!account?.publicKey) return;
    
    setIsSubmitting(true);
    setError(null);
    setTxHash(null);
    
    try {
      const pollService = getPollService();
      const result = await pollService.claimReward(pollId);
      setTxHash(result.txHash);
      console.log('[MicroPoll] Reward claimed:', result.txHash);
      
      // Anketleri yenile
      await fetchPolls();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[MicroPoll] Claim error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="brutalist-heading text-xl mb-4">ACTIVE POLLS</h2>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border-3 border-red-600 p-3 mb-4 font-bold text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Başarı mesajı */}
      {txHash && (
        <div className="bg-green-100 border-3 border-green-600 p-3 mb-4">
          <div className="font-bold text-green-800">✓ Transaction confirmed!</div>
          <a 
            href={getStellarExpertUrl(txHash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm underline text-green-700"
          >
            View on Stellar Expert
          </a>
        </div>
      )}

      {/* Yükleniyor */}
      {isLoading ? (
        <div className="text-center py-8 font-bold">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="text-center py-8 font-bold">No polls yet. Create one!</div>
      ) : (
        /* 2 kolonlu grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              isWalletConnected={isWalletConnected}
              userVoted={votedPolls.includes(poll.id)}
              onVote={handleVote}
              onClaimReward={handleClaimReward}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
