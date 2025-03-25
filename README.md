# 🚀 Crowdfunding DApp on Blockchain

## 🔥 Revolutionizing Crowdfunding with Web3 & Blockchain

This cutting-edge Crowdfunding Decentralized Application (DApp) redefines fundraising by leveraging blockchain technology. Built with **TypeScript, JavaScript, Solidity**, and powered by **MetaMask & Ganache**, this app ensures **security, transparency, and decentralization** in crowdfunding campaigns.

## 🤔 What is Crowdfunding?
Crowdfunding is a method of raising funds from a large number of people, typically via the internet. It allows individuals, startups, and organizations to present their ideas or projects and receive financial support from backers. 


## ✨ Features
✅ **Decentralized & Trustless** – Eliminates intermediaries, ensuring direct fund transfers.  
✅ **Secure Transactions** – Ethereum smart contracts guarantee safety.  
✅ **Real-time Campaign Monitoring** – View funding status and progress instantly.  
✅ **MetaMask Integration** – Enables seamless user authentication and payments.  
✅ **Local Blockchain Testing** – Utilizes Ganache for a smooth development experience.  
✅ **Smart Contract-driven Fund Allocation** – Funds are released only when campaign goals are met.  

## 🏗️ Tech Stack
- **Frontend:** TypeScript, JavaScript, React.js  
- **Backend:** Solidity Smart Contracts  
- **Blockchain:** Ethereum, Ganache  
- **Wallet:** MetaMask  

## 🛠️ Installation & Setup
1. **Start Local Blockchain (Ganache):**
   ```sh
   ganache-cli -p 7545
   ```
   *Ganache provides a local blockchain network for development, creating test accounts with ETH.*

2. **Install Dependencies:**
   ```sh
   npm install
   ```
   *Ensures all required dependencies are installed.*

3. **Compile & Deploy Smart Contracts:**
   ```sh
   truffle compile
   truffle migrate
   ```
   *This compiles Solidity smart contracts and deploys them to your local Ganache network.*

4. **MetaMask Setup:**
   - **Network Configuration:**
     - Open MetaMask → Click on Networks → Add Custom RPC
     - **Network Name:** Localhost 7545
     - **New RPC URL:** `http://localhost:7545`
     - **Chain ID:** 1337 (or 5777 for some setups)
   - **Import Test Accounts:**
     - Copy private keys from Ganache and import them into MetaMask.

5. **Verify Smart Contract Deployment:**
   ```sh
   truffle console
   ```
   Then, run:
   ```sh
   Crowdfunding.deployed().then(instance => console.log(instance.address))
   ```
   *Checks if your smart contract is properly deployed.*

6. **Start the Frontend Application:**
   ```sh
   cd blockchain-crowdfunding
   npm run dev
   ```
   *This launches the Next.js development server at http://localhost:3000 (or 3001 if 3000 is in use).*  

7. **Run Tests (Optional but Recommended):**
   ```sh
   truffle test
   ```
   *Ensures the contracts work as expected before using them.*

### 🔹 Important Notes:
- Keep all three terminal windows open while working on the project.
- Ensure MetaMask is connected to **http://localhost:7545**.
- Import a Ganache test account using its private key.

### ⚠️ Common Issues & Fixes:
- **If you see `EADDRINUSE` error for Ganache:**
  - This means Ganache is already running. Either use the existing instance or restart it.
- **If Port 3000 is in use:**
  - Next.js will automatically switch to Port 3001; simply use the new URL.
- **To reset everything:**
  ```sh
  truffle migrate --reset
  ```
  - This redeploys contracts after stopping all running processes and restarting Ganache.

## 🖼️ Adding Screenshots to GitHub
1. Create a folder named `screenshots` inside your repository.
2. Add your images (e.g., `home.png`, `campaign.png`).
3. Reference them in README:
   ```md
   ![Home Page](screenshots/home.png)
   ![Campaign Details](screenshots/campaign.png)
   ```

## 🎯 Why This DApp?
🔹 **Secure & Fraud-proof:** Blockchain prevents fund misuse.  
🔹 **Transparent Transactions:** Public ledger ensures accountability.  
🔹 **Easy & Fast Contributions:** Smart contracts handle funding seamlessly.  

## 🤝 Contributing
Fork the repo, create a new branch, make changes, and submit a PR. Contributions are welcome! 🚀

## 📜 License
This project is licensed under the **MIT License**.

