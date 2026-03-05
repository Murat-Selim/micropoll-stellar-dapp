# 🗳️ MicroPoll — Workshop Prompt Serisi
**Stellar Soroban dApp | 4-Step Few-Shot Prompts**

---

## Nasıl Kullanılır?

Her adımı sırayla AI'ya ver. Bir adım bitmeden sonrakine geçme.
Her prompt kendi içinde bağımsız ama bir önceki adımın çıktısını referans alır.

---

---

# STEP 1 — FRONTEND

## Örnek Girdi (Few-Shot Reference)
> *Bu örnek, AI'ın beklenen yaklaşımı görmesi için verilmiştir.*

**Kullanıcı:** "Basit bir counter dApp frontend'i yaz, wallet bağlantısı olmasın."

**AI Çıktısı (Beklenen Format):**
```
Klasör yapısı:
app/
  page.tsx
components/
  Counter.tsx
  StatsDisplay.tsx

// Counter.tsx — Ana sayaç bileşeni
export default function Counter() {
  // Mock data kullanıyoruz, henüz blockchain bağlantısı yok
  const [count, setCount] = useState(0)
  return <button onClick={() => console.log('clicked')}>{count}</button>
}
```

---

## Asıl Prompt — MicroPoll Step 1

```
## Role Assignment
You are an experienced frontend developer specializing in
Soroban smart contracts and Next.js applications.
You also have a strong eye for retro-brutalist web design.

## Context Setting
We are building "MicroPoll" — a Sybil-resistant paid opinion
platform dApp for a beginner workshop.
- Audience: Developers who have never built a dApp before
- Blockchain: Stellar (Soroban smart contracts)
- Concept: Users connect wallet, pay small XLM to create polls,
  cast votes on existing polls, and claim XLM rewards.
- Bot-resistant: every action requires a real wallet signature.
- This is Step 1 of 4. No blockchain logic yet — UI only.

## Visual Style (Few-Shot Reference)
The design must follow a retro-brutalist aesthetic:
- Background: #F0F0F0, white cards with 3px solid black borders
- Bold, uppercase, monospace headings
- NO gradients, NO shadows, NO rounded corners
- Colored accent shapes per card:
  red = create poll, blue = vote, yellow = rewards, purple = stats
- High contrast black/white, grid layout
- Feels like a newspaper or zine — raw, bold, intentional
- Overall vibe: Web3 meets 1990s punk poster

## Requirements
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- @stellar/stellar-sdk installed but NOT used yet
- @creit-tech/stellar-wallets-kit installed but NOT used yet

## Structured Output — Component Structure
1. WalletBar
   - Top bar with thick black bottom border
   - Left: "MICROPOLL" logo in monospace bold
   - Right: "CONNECT WALLET" button (placeholder) + XLM balance placeholder
   
2. CreatePollForm
   - Card with red accent dot (top-right corner)
   - Question text input (full width)
   - 2–4 option inputs (add/remove option buttons)
   - XLM reward pool input
   - Duration selector (1h / 6h / 24h / 7d)
   - "CREATE POLL" button — disabled when wallet not connected

3. PollList
   - Grid of poll cards (2 columns)
   - Each card shows:
     * Question in bold uppercase
     * Options as thick progress bars with vote % and count
     * Reward pool in XLM (blue accent)
     * Countdown timer to deadline
     * "VOTE" button — disabled when not connected
     * "CLAIM REWARD" button — disabled, shown after poll closes

4. StatsBar
   - Row of 4 stat cards with colored accent shapes
   - Total Polls (red dot), Total Votes (blue diamond),
     Total XLM Pooled (yellow triangle), Your Earnings (purple square)

## Mock Data
Use these 3 hardcoded polls:
Poll 1: "Should Stellar add native NFT support?"
  Options: ["Yes", "No", "Maybe later"]
  Votes: [142, 89, 34], Pool: 50 XLM, Deadline: 2h remaining

Poll 2: "Best consensus mechanism?"
  Options: ["SCP", "PoS", "PoW", "DAG"]
  Votes: [201, 156, 43, 78], Pool: 120 XLM, Deadline: 23h remaining

Poll 3: "Will XLM reach $1 in 2025?"
  Options: ["Yes", "No"]
  Votes: [312, 198], Pool: 200 XLM, Deadline: CLOSED

## Constraints
- All action buttons disabled when wallet is not connected
- Add `data-testid` attributes to all interactive elements
- Each component in a separate file under /components
- Comments in Turkish on critical lines
- Log all button clicks: console.log('[MicroPoll] action:', payload)
- Strictly follow retro-brutalist style
- Do NOT add hover animations or transitions
- Do NOT implement any blockchain logic

## Output Format
1. Folder structure in tree format
2. Each file in order, filename as heading
3. Turkish comments on critical lines in every file
4. "What comes next" summary (2-3 sentences max)

## Chain-of-Thought
Before creating each component, briefly explain:
- Its purpose and visual layout
- Which mock data it consumes
- How it connects to other components
```

---

---

# STEP 2 — WALLET CONNECTION

## Örnek Girdi (Few-Shot Reference)
> *Bu örnek doğru wallet entegrasyon yaklaşımını gösterir.*

**Kullanıcı:** "Freighter cüzdanını bağlamak istiyorum."

**AI Çıktısı (Beklenen — YANLIŞ yaklaşım):**
```javascript
// ❌ YANLIŞ — Deprecated paket
import freighter from '@stellar/freighter-api'
const publicKey = await freighter.getPublicKey()
```

**AI Çıktısı (Beklenen — DOĞRU yaklaşım):**
```javascript
// ✅ DOĞRU — 2025 best practice
import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID } from '@creit-tech/stellar-wallets-kit'

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
})
await kit.openModal({ onWalletSelected: async (option) => {
  kit.setWallet(option.id)
  const { address } = await kit.getAddress()
}})
```

---

## Asıl Prompt — MicroPoll Step 2

```
## Role Assignment
You are an experienced full-stack Stellar blockchain developer
specializing in Soroban smart contracts, Next.js, and
Stellar Wallets Kit integration.

## Context Setting
We are building "MicroPoll" dApp — Step 2 of 4.
- Step 1 complete: Next.js + TypeScript + Tailwind CSS
- Components ready: WalletBar, CreatePollForm, PollList, StatsBar
- All buttons disabled, using mock data
- This is Step 2: add real wallet connection only

## Task Definition
Integrate @creit-tech/stellar-wallets-kit for wallet connection.
Replace WalletBar placeholder with a real wallet flow.
Do NOT interact with any smart contract yet.

Docs reference:
https://developers.stellar.org/docs/build/guides/freighter/integrate-freighter-react

## CRITICAL: Package Warning
Do NOT use @stellar/freighter-api — it is deprecated in 2025.
Always use @creit-tech/stellar-wallets-kit instead.

## Requirements
- @creit-tech/stellar-wallets-kit (unified wallet abstraction)
- React Context API for global wallet state (WalletContext)
- Stellar Testnet network only
- Fetch real XLM balance from Horizon testnet after connect:
  GET https://horizon-testnet.stellar.org/accounts/{address}
  Parse: balances[].find(b => b.asset_type === 'native').balance

## Structured Output — Implementation Flow
1. Check if Freighter extension is installed
   → If not: show install link to freighter.app

2. "CONNECT WALLET" button triggers StellarWalletsKit modal

3. On success:
   → Store address in WalletContext
   → Fetch XLM balance from Horizon
   → Display: "G...XYZ" (first 4 + last 3 chars) + "XX.XX XLM"
   → Enable all action buttons globally

4. "DISCONNECT" button:
   → Clear address, balance, and kit state
   → Disable all action buttons again

5. Network check:
   → Verify connected network is Testnet
   → If Mainnet/other: show red warning banner, block actions

## Files
New files:
- context/WalletContext.tsx  — address, balance, isConnected, connect(), disconnect()
- hooks/useWallet.ts         — convenience hook wrapping WalletContext

Modified files:
- components/WalletBar.tsx   — replace placeholder with real flow
- app/layout.tsx             — wrap with WalletProvider

## Constraints
- Use StellarWalletsKit with FREIGHTER_ID as the default wallet
- Do NOT use deprecated @stellar/freighter-api
- Wallet state must persist across all components via Context
- Do NOT modify CreatePollForm, PollList, or StatsBar logic yet
- Handle errors: extension not found, user rejected, network error
- Comments in Turkish on critical lines

## Output Format
1. List new files and modified files separately
2. Each file with filename as heading
3. Turkish comments on critical lines
4. "What comes next" summary (2-3 sentences max)

## Chain-of-Thought
Before each file: explain what changes you are making and why,
step by step. Mention what could go wrong and how you handle it.
```

---

---

# STEP 3 — SMART CONTRACT

## Örnek Girdi (Few-Shot Reference)
> *Bu örnek doğru Soroban storage pattern'ini gösterir.*

**Kullanıcı:** "Soroban'da basit bir sayaç contract'ı yaz."

**AI Çıktısı (Beklenen — YANLIŞ yaklaşım):**
```rust
// ❌ YANLIŞ — Raw string key kullanımı
env.storage().instance().set(&String::from("total"), &count);
```

**AI Çıktısı (Beklenen — DOĞRU yaklaşım):**
```rust
// ✅ DOĞRU — #[contracttype] enum key kullanımı
#[contracttype]
pub enum DataKey {
    TotalCount,
    UserCount(Address),
}

env.storage().instance().set(&DataKey::TotalCount, &count);
env.storage().persistent().set(&DataKey::UserCount(user.clone()), &user_count);
// TTL extend — state archival'ı önle
env.storage().persistent().extend_ttl(&DataKey::UserCount(user), 100, 100);
```

---

## Asıl Prompt — MicroPoll Step 3

```
## Role Assignment
You are an experienced Stellar Soroban smart contract developer
specializing in Rust and blockchain storage patterns.

## Context Setting
We are building "MicroPoll" dApp — Step 3 of 4.
- Step 1 & 2 complete: Frontend + Wallet connection working
- Now: write the on-chain logic
- Contract name: micro_poll
- Do NOT deploy yet — only write contract code + Cargo.toml

## Task Definition
Write a Soroban smart contract in Rust that handles:
- Poll creation with XLM reward staking
- Voting (one vote per wallet per poll)
- Reward distribution to all voters equally

## Data Structures (Use Exactly These)

```rust
#[contracttype]
pub enum DataKey {
    Poll(u64),              // Persistent: poll by ID
    UserVote(Address, u64), // Persistent: has user voted on poll?
    PollCount,              // Instance: total polls created
    Admin,                  // Instance: admin address
}

#[contracttype]
pub struct Poll {
    pub id: u64,
    pub creator: Address,
    pub question: soroban_sdk::String,
    pub options: Vec<soroban_sdk::String>,
    pub votes: Vec<u64>,       // vote count per option index
    pub reward_pool: i128,     // in stroops (1 XLM = 10_000_000)
    pub deadline: u64,         // Unix timestamp (env.ledger().timestamp())
    pub is_closed: bool,
    pub voter_count: u64,
}

#[contracterror]
pub enum PollError {
    NotInitialized    = 1,
    PollNotFound      = 2,
    PollClosed        = 3,
    DeadlinePassed    = 4,
    AlreadyVoted      = 5,
    InvalidOption     = 6,
    InvalidOptions    = 7,  // less than 2 or more than 4 options
    Unauthorized      = 8,
    RewardAlreadyClaimed = 9,
}
```

## Contract Functions

1. initialize(env: Env, admin: Address)
   - Set Admin in instance storage
   - Set PollCount = 0
   - Panic if already initialized

2. create_poll(env: Env, creator: Address, question: String,
               options: Vec<String>, reward_pool: i128,
               duration_seconds: u64)
   - require_auth(&creator)
   - Validate: 2 <= options.len() <= 4
   - Validate: reward_pool > 0
   - Initialize votes vec with zeros (same length as options)
   - Set deadline = env.ledger().timestamp() + duration_seconds
   - Store Poll with next PollCount as ID
   - Increment PollCount

3. vote(env: Env, user: Address, poll_id: u64, option_index: u32)
   - require_auth(&user)
   - Load poll — error if not found
   - Check: !poll.is_closed
   - Check: env.ledger().timestamp() < poll.deadline
   - Check: UserVote(user, poll_id) does not exist
   - Check: option_index < options.len()
   - Increment poll.votes[option_index]
   - Increment poll.voter_count
   - Set UserVote(user, poll_id) = true
   - Save updated poll

4. close_poll(env: Env, caller: Address, poll_id: u64)
   - require_auth(&caller)
   - Load poll
   - Verify: caller == poll.creator OR caller == Admin
   - Set poll.is_closed = true
   - Save poll

5. claim_reward(env: Env, user: Address, poll_id: u64)
   - require_auth(&user)
   - Load poll
   - Verify: poll.is_closed == true
   - Verify: UserVote(user, poll_id) == true
   - Verify: UserVote(user, poll_id) != "claimed" (use separate key)
   - Calculate: share = poll.reward_pool / poll.voter_count as i128
   - Transfer XLM using token::Client (Stellar Asset Contract)
   - Mark as claimed

6. get_poll(env: Env, poll_id: u64) -> Poll
   - Return poll or PollNotFound error

7. get_poll_count(env: Env) -> u64
   - Return PollCount from instance storage

8. has_voted(env: Env, user: Address, poll_id: u64) -> bool
   - Return whether UserVote(user, poll_id) exists

## Storage Rules
- Instance storage: Admin, PollCount (contract lifecycle data)
- Persistent storage: Poll(id), UserVote(address, id) (user data)
- ALWAYS use #[contracttype] DataKey enum — NEVER raw strings
- ALWAYS extend TTL after writing persistent entries:
  env.storage().persistent().extend_ttl(&key, 100, 100);

## Requirements
- soroban-sdk = { version = "22", features = ["testutils"] }
- Include #[cfg(test)] unit tests for every function
- Test: create poll, vote, double-vote should fail,
  vote after deadline should fail, claim reward
- Comments in Turkish

## Output Format
1. Project folder structure in tree format
2. Cargo.toml with all dependencies
3. lib.rs with full contract code
4. Test module at bottom of lib.rs
5. Build command: stellar contract build
6. "What comes next" summary

## Chain-of-Thought
Before each function: explain storage keys used,
validations performed, and edge cases handled.
```

---

---

# STEP 4 — DEPLOYMENT & INTEGRATION

## Örnek Girdi (Few-Shot Reference)
> *Bu örnek doğru CLI kullanımını ve binding yaklaşımını gösterir.*

**Kullanıcı:** "Contract'ı deploy etmek istiyorum."

**AI Çıktısı (Beklenen — YANLIŞ yaklaşım):**
```bash
# ❌ YANLIŞ — Eski CLI adı
soroban contract deploy --wasm contract.wasm
```

**AI Çıktısı (Beklenen — DOĞRU yaklaşım):**
```bash
# ✅ DOĞRU — 2024'te yeniden adlandırıldı
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/micro_poll.wasm \
  --source poll-admin \
  --network testnet

# ✅ DOĞRU — Manuel XDR yerine otomatik TypeScript binding
stellar contract bindings typescript \
  --contract-id CXXXXX... \
  --output-dir ./src/contracts/micro_poll \
  --network testnet
```

---

## Asıl Prompt — MicroPoll Step 4

```
## Role Assignment
You are an experienced Stellar Soroban developer specializing
in contract deployment, Stellar CLI, and frontend-to-contract
integration with Stellar Wallets Kit.

## Context Setting
We are building "MicroPoll" dApp — Step 4 of 4 (FINAL).
- Step 1: Frontend (WalletBar, CreatePollForm, PollList, StatsBar)
- Step 2: Wallet (Stellar Wallets Kit + Freighter, WalletContext)
- Step 3: Contract (micro_poll Soroban Rust contract, ready to deploy)
- Now: deploy to Testnet + connect frontend to live contract

## CRITICAL: CLI Name Change
The Soroban CLI was renamed in 2024.
- ❌ OLD (broken): soroban contract deploy
- ✅ NEW (correct): stellar contract deploy
Always use "stellar" not "soroban" for all CLI commands.

## Part A — Deployment Commands
Show all commands in order with expected terminal output:

1. Create deployer identity
   stellar keys generate --global poll-admin --network testnet
   → Expected: "Identity created: poll-admin"

2. Fund with Friendbot
   stellar keys fund poll-admin --network testnet
   → Expected: "Account funded. Balance: 10000 XLM"

3. Build the contract
   stellar contract build
   → Expected: target/wasm32-unknown-unknown/release/micro_poll.wasm

4. Deploy to Testnet
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/micro_poll.wasm \
     --source poll-admin \
     --network testnet
   → Expected: Contract ID starting with "C..."

5. Initialize the contract
   stellar contract invoke \
     --id <CONTRACT_ID> \
     --source poll-admin \
     --network testnet \
     -- initialize \
     --admin <POLL_ADMIN_PUBLIC_KEY>
   → Expected: null (void return)

6. Generate TypeScript bindings (IMPORTANT — do not skip)
   stellar contract bindings typescript \
     --contract-id <CONTRACT_ID> \
     --output-dir ./src/contracts/micro_poll \
     --network testnet
   → Expected: TypeScript client generated in ./src/contracts/micro_poll

## Part B — Frontend Integration
Use auto-generated TypeScript bindings.
Do NOT write manual XDR encoding/decoding code.

Files to create/modify:

1. .env.local (new)
   NEXT_PUBLIC_CONTRACT_ID=C...
   NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

2. lib/pollService.ts (new)
   - Import generated client from ./src/contracts/micro_poll
   - Wrap each contract call with: simulate → sign with kit → submit
   - Export functions:
     * createPoll(kit, question, options, rewardXLM, durationSec)
     * vote(kit, pollId, optionIndex)
     * closePoll(kit, pollId)
     * claimReward(kit, pollId)
     * getPoll(pollId): Promise<Poll>
     * getPollCount(): Promise<number>
     * hasVoted(address, pollId): Promise<boolean>
   - All write functions: show loading → sign → submit → return txHash

3. components/CreatePollForm.tsx (modify)
   - On submit: call pollService.createPoll()
   - Show spinner during tx
   - On success: show toast with Stellar Expert link
   - On error: show error toast (user rejected / network error)
   - Reset form after success

4. components/PollList.tsx (modify)
   - On mount: fetch all polls via getPollCount() + getPoll(id) loop
   - Poll every 5 seconds for updates
   - For each poll: call hasVoted(address, pollId) to set button state
   - VOTE button: call pollService.vote() → refresh poll
   - CLAIM button: visible only when poll.is_closed && hasVoted
   - Show real progress bars from poll.votes data

5. components/StatsBar.tsx (modify)
   - Fetch real data: total polls, sum of all reward pools,
     total votes across all polls
   - Calculate "Your Earnings": sum of claimed rewards (from events)

## UX Requirements
- Loading spinner inside button during pending transaction
- Disable ALL buttons while any transaction is pending
- Success toast: "✓ Transaction confirmed" + Stellar Expert TX link
  https://stellar.expert/explorer/testnet/tx/{txHash}
- Error toast: Turkish error messages
  * User rejected → "İşlem iptal edildi"
  * Network error → "Ağ hatası, tekrar deneyin"
  * Already voted → "Bu ankete zaten oy verdiniz"
- Auto-refresh PollList after successful vote / create / claim

## Constraints
- Testnet ONLY — no mainnet code anywhere
- Use auto-generated bindings — no manual XDR
- Comments in Turkish
- Error messages shown to user must be in Turkish

## Output Format
1. All deployment commands (numbered, with expected output)
2. Each new/modified frontend file with filename as heading
3. Turkish comments on critical lines
4. "Full Flow Test Checklist" at the end

## Chain-of-Thought
Before each deployment command: what it does + expected output.
Before each frontend file: how it connects to the contract.

## Full Flow Test Checklist (include this at the end)
The AI must generate a checklist with these items:
☐ Freighter extension installed and set to Testnet
☐ poll-admin identity funded with Friendbot
☐ Contract deployed, Contract ID saved to .env.local
☐ initialize() called successfully
☐ TypeScript bindings generated
☐ Wallet connect works, XLM balance shows
☐ Create poll → Freighter signs → poll appears in list
☐ Vote → Freighter signs → progress bar updates
☐ Cannot vote twice on same poll
☐ close_poll → CLAIM button appears
☐ Claim reward → XLM arrives in wallet
☐ All transactions visible on Stellar Expert
```

---

---

## 📌 Genel Kullanım Notları

**Adım sırası önemli** — Her adımı sırayla ver, atlamadan.

**"Step X complete" satırını güncelle** — Her adımda AI'ya bir önceki adımın bittiğini belirt. Context uzunsa önceki kodun önemli kısımlarını kısaca hatırlat.

**Hata alırsan** — Hata mesajını olduğu gibi kopyalayıp AI'ya "Bu hatayı fix et, Step X'in kısıtlamalarına uyarak" şeklinde ver.

**Testnet faucet** — `https://friendbot.stellar.org/?addr=YOUR_ADDRESS`

**Explorer** — `https://stellar.expert/explorer/testnet`
