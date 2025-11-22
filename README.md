
# 📦 StockMaster – Real-Time, AI-Assisted & Blockchain-Secured Inventory Management

*Built for the Odoo x SPIT Hackathon 2025*

## 🚀 Overview
StockMaster is a next-generation Inventory Management System (IMS) that replaces manual registers, Excel-based tracking, and disconnected systems. It provides real-time stock monitoring, blockchain-backed audit logs, AI assistance, and smart analytics.

## ✨ Features
- 🔐 Firebase Auth (Login/Signup/OTP Reset)
- 👥 Role-Based Access (Manager / Warehouse Staff)
- 📦 Product & Warehouse Management
- 🏬 Multi-Warehouse Inventory Tracking
- 📥 Receipts | 📤 Delivery | 🔄 Transfers | ⚙ Adjustments
- 🔗 Blockchain Transaction Logging (Tamper-proof)
- 🤖 AI Inventory Assistant (Gemini API)
- 📊 Dashboard KPIs (Low Stock, Pending Orders, Movements)
- 📁 Export Reports (CSV, Excel)
- 🔔 Stock Alerts (Low/Out-of-Stock)

## 🛠 Technology Stack
| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Tailwind CSS, Firebase SDK |
| Backend | Node.js, Express.js, Firebase Admin |
| Database | Firestore (NoSQL) |
| AI Assistant | Gemini API |
| Blockchain | Hardhat, Solidity, Ethers.js |
| Reports | XLSX, FileSaver |

## 🔐 Roles & Access
| Feature         | Inventory Manager | Warehouse Staff |
|-----------------|-------------------|------------------|
| Dashboard       | ✔                 | ✔               |
| Profile         | ✔                 | ✔               |
| History         | ✔                 | ✔               |
| AI Assistant    | ✔                 | ✔               |
| Products        | ✔                 | ❌               |
| Receipts        | ✔                 | ✔               |
| Delivery Orders | ✔                 | ❌               |
| Warehouses      | ✔                 | ❌               |
| Transfers       | ✔                 | ✔               |
| Adjustments     | ✔                 | ✔               |


## ⚙ Project Setup

### 1️⃣ Clone the Repository
```bash
https://github.com/Rajgohel0312/Odoo-SPIT-StockMaster-IMS
cd Odoo-SPIT-StockMaster-IMS
```

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

🔑 **.env.local**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=xxxx
REACT_APP_GEMINI_API_KEY=xxxx
```

### 3️⃣ Backend Setup
```bash
cd backend
npm install
node server.js
```

🔑 **.env**
```
PORT=5000
SMTP_USER=xxxx
SMTP_PASS=xxxx
BLOCKCHAIN_RPC=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=xxxx
BLOCKCHAIN_CONTRACT_ADDRESS=xxxx
GEMINI_API_KEY=xxxx
```

### 4️⃣ Smart Contract (Blockchain) Setup
```bash
cd smart-contract
npm install
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

💾 **smart-contract/.env**
```
PRIVATE_KEY=xxxx
RPC_URL=xxxx
```

## 📎 Export / Reports
| Format | Supported |
|--------|-----------|
| CSV | ✔ |
| Excel | ✔ |

## 📈 Dashboard KPIs
- Total Products
- Low Stock Alerts
- Pending Receipts
- Pending Deliveries
- Internal Transfers

## 🤖 AI Assistant Capabilities
Ask queries like:
> 🔹 Show products below reorder level  
> 🔹 Generate delivery summary  
> 🔹 Explain warehouse stock update logic  

---

## 📌 Author
👤 **Raj Gohel**  
📧 rajgohel2018@gmail.com  

🎯 Built for transparency, accuracy & innovation!
