import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  u64,
  i128,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBSTEJ36XRIE5TLCR5OEDDMT7AJPRKL27MRFKOX3CMV2P5Q4OBNMW5W4",
  }
} as const

export type DataKey = {tag: "Poll", values: readonly [u64]} | {tag: "UserVote", values: readonly [string, u64]} | {tag: "PollCount", values: void} | {tag: "Admin", values: void} | {tag: "Claimed", values: readonly [string, u64]};


export interface Poll {
  creator: string;
  deadline: u64;
  id: u64;
  is_closed: boolean;
  options: Array<string>;
  question: string;
  reward_pool: i128;
  voter_count: u64;
  votes: Array<u64>;
}

export const PollError = {
  1: {message:"NotInitialized"},
  2: {message:"PollNotFound"},
  3: {message:"PollClosed"},
  4: {message:"DeadlinePassed"},
  5: {message:"AlreadyVoted"},
  6: {message:"InvalidOption"},
  7: {message:"InvalidOptions"},
  8: {message:"Unauthorized"},
  9: {message:"RewardAlreadyClaimed"}
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin}: {admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_poll: ({creator, question, pollOptions, reward_pool, duration_seconds}: {creator: string, question: string, pollOptions: Array<string>, reward_pool: i128, duration_seconds: u64}, txOptions?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({user, poll_id, option_index}: {user: string, poll_id: u64, option_index: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a close_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_poll: ({caller, poll_id}: {caller: string, poll_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a claim_reward transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_reward: ({user, poll_id}: {user: string, poll_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a get_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_poll: ({poll_id}: {poll_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Poll>>>

  /**
   * Construct and simulate a get_poll_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_poll_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a has_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_voted: ({user, poll_id}: {user: string, poll_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAEAAAAAAAAABFBvbGwAAAABAAAABgAAAAEAAAAAAAAACFVzZXJWb3RlAAAAAgAAABMAAAAGAAAAAAAAAAAAAAAJUG9sbENvdW50AAAAAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAABAAAAAAAAAAdDbGFpbWVkAAAAAAIAAAATAAAABg==",
        "AAAAAQAAAAAAAAAAAAAABFBvbGwAAAAJAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAACaWQAAAAAAAYAAAAAAAAACWlzX2Nsb3NlZAAAAAAAAAEAAAAAAAAAB29wdGlvbnMAAAAD6gAAABAAAAAAAAAACHF1ZXN0aW9uAAAAEAAAAAAAAAALcmV3YXJkX3Bvb2wAAAAACwAAAAAAAAALdm90ZXJfY291bnQAAAAABgAAAAAAAAAFdm90ZXMAAAAAAAPqAAAABg==",
        "AAAABAAAAAAAAAAAAAAACVBvbGxFcnJvcgAAAAAAAAkAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAABAAAAAAAAAAxQb2xsTm90Rm91bmQAAAACAAAAAAAAAApQb2xsQ2xvc2VkAAAAAAADAAAAAAAAAA5EZWFkbGluZVBhc3NlZAAAAAAABAAAAAAAAAAMQWxyZWFkeVZvdGVkAAAABQAAAAAAAAANSW52YWxpZE9wdGlvbgAAAAAAAAYAAAAAAAAADkludmFsaWRPcHRpb25zAAAAAAAHAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAAIAAAAAAAAABRSZXdhcmRBbHJlYWR5Q2xhaW1lZAAAAAk=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAJUG9sbEVycm9yAAAA",
        "AAAAAAAAAAAAAAALY3JlYXRlX3BvbGwAAAAABQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAhxdWVzdGlvbgAAABAAAAAAAAAAB29wdGlvbnMAAAAD6gAAABAAAAAAAAAAC3Jld2FyZF9wb29sAAAAAAsAAAAAAAAAEGR1cmF0aW9uX3NlY29uZHMAAAAGAAAAAQAAA+kAAAAGAAAH0AAAAAlQb2xsRXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAdwb2xsX2lkAAAAAAYAAAAAAAAADG9wdGlvbl9pbmRleAAAAAQAAAABAAAD6QAAA+0AAAAAAAAH0AAAAAlQb2xsRXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAKY2xvc2VfcG9sbAAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAdwb2xsX2lkAAAAAAYAAAABAAAD6QAAA+0AAAAAAAAH0AAAAAlQb2xsRXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAMY2xhaW1fcmV3YXJkAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAAB3BvbGxfaWQAAAAABgAAAAEAAAPpAAAACwAAB9AAAAAJUG9sbEVycm9yAAAA",
        "AAAAAAAAAAAAAAAIZ2V0X3BvbGwAAAABAAAAAAAAAAdwb2xsX2lkAAAAAAYAAAABAAAD6QAAB9AAAAAEUG9sbAAAB9AAAAAJUG9sbEVycm9yAAAA",
        "AAAAAAAAAAAAAAAOZ2V0X3BvbGxfY291bnQAAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAAAAAAAJaGFzX3ZvdGVkAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAAB3BvbGxfaWQAAAAABgAAAAEAAAAB" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        create_poll: this.txFromJSON<Result<u64>>,
        vote: this.txFromJSON<Result<void>>,
        close_poll: this.txFromJSON<Result<void>>,
        claim_reward: this.txFromJSON<Result<i128>>,
        get_poll: this.txFromJSON<Result<Poll>>,
        get_poll_count: this.txFromJSON<u64>,
        has_voted: this.txFromJSON<boolean>
  }
}