🌟 Fund Vote App
A decentralized voting application built on the Stellar blockchain with Soroban smart contracts, enabling poll creation with automatic XLM rewards per vote.

📌 Overview
Fund Vote App is a Web3 platform where users can create polls and fund each vote with XLM tokens. Voters receive real-time rewards, while the blockchain ensures transparency, security, and decentralization.

⚙️ Features
Voting System
Create customizable, time-limited polls

Reward voters with XLM per vote

Live results and vote tracking

Blockchain Integration
Built with Soroban smart contracts on Stellar

Wallet support via Freighter

Instant token transfers

UI/UX
Modern and responsive design

User dashboard for tracking polls and votes

🧱 Tech Stack
Frontend: Next.js, Tailwind CSS, TypeScript

Blockchain: Stellar + Soroban (Rust)

Wallet: Freighter

Smart Contracts: Rust (via Soroban CLI)

🚀 Getting Started
Requirements
Node.js 18+

Rust

Soroban CLI

Freighter Wallet

Quick Start
git clone https://github.com/bedrettinakyuz/fund-vote-app.git
cd fund-vote-app
npm install
npm run dev
Set environment variables in .env.local. Make sure the smart contract is deployed to the Stellar testnet.

🧠 Smart Contract
rust
// Key Functions
create_poll(env, creator, title, options, funding, duration) -> poll_id
vote(env, voter, poll_id, option_index)
get_poll(env, poll_id) -> Poll
get_results(env, poll_id) -> Vec<u32>
Emits events like PollCreated, VoteCast, and FundsDistributed.

📁 Project Structure
csharp
Kopyala
Düzenle
fund-vote-app/
├── frontend/       # UI components
├── contracts/        # Soroban smart contracts
📞 Contact

GitHub: github.com/bedrettinakyuz/fund-vote-app




⭐ Star this repo if you like it!

Made with ❤️ for decentralized voting on Stellar

If you'd like, I can also generate a shorter version for your GitHub description or a polished tagline. Let me know!






