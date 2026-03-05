# MicroPoll - Stellar Soroban dApp

A Sybil-resistant paid opinion platform built on Stellar blockchain using Soroban smart contracts. Users can create polls, vote on existing polls, and claim XLM rewards.

## Features

- **Wallet Integration**: Connect with Freighter wallet (Stellar Testnet)
- **Create Polls**: Create new polls with custom questions, options, and reward pools
- **Vote**: Cast votes on active polls (one vote per wallet per poll)
- **Reward System**: Claim XLM rewards after polls close
- **Real-time Stats**: View total polls, votes, and pooled XLM

## Project Structure

```
micropoll/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   │   ├── WalletBar.tsx      # Wallet connection UI
│   │   ├── CreatePollForm.tsx # Poll creation form
│   │   ├── PollList.tsx       # Poll display and voting
│   │   └── StatsBar.tsx       # Statistics display
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   │   └── pollService.ts     # Contract interaction service
│   └── contracts/              # Generated contract bindings
│       └── micro_poll/        # Soroban contract TypeScript client
├── contracts/
│   └── micro_poll/            # Rust smart contract
└── .env.local                 # Environment variables
```

## Prerequisites

- Node.js 18+
- npm or yarn
- [Freighter Wallet](https://freighter.app) browser extension
- Stellar Testnet account

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Edit `.env.local` with your contract configuration:
   ```
   NEXT_PUBLIC_CONTRACT_ID=your_contract_id
   NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
   ```

3. **Generate contract bindings** (if contract is updated):
   ```bash
   stellar contract bindings typescript \
     --contract-id YOUR_CONTRACT_ID \
     --output-dir ./src/contracts/micro_poll \
     --network testnet
   ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
```

## Smart Contract

The Soroban smart contract is located in `contracts/micro_poll/`. It provides:

- `create_poll`: Create a new poll with reward pool
- `vote`: Cast a vote on a poll
- `close_poll`: Close a poll (creator or admin only)
- `claim_reward`: Claim share of reward pool
- `get_poll`: Read poll data
- `get_poll_count`: Get total poll count
- `has_voted`: Check if user voted

### Build Contract

```bash
cd contracts/micro_poll
cargo build --target wasm32v1-none --release
```

### Deploy Contract

```bash
# Create identity
stellar keys generate --global poll-admin --network testnet

# Fund account
stellar keys fund poll-admin --network testnet

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/micro_poll.wasm \
  --source poll-admin \
  --network testnet
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Stellar Soroban
- **Wallet**: Freighter via stellar-wallets-kit
- **Contract**: Rust, soroban-sdk

## License

MIT
