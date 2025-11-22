const { ethers } = require("ethers");
require("dotenv").config();

let contract;

const initBlockchain = () => {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
  const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
  );

  const contractJSON = require("../blockchain/StockLedger_abi.json");
  const abi = contractJSON.abi;
  const address = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

  contract = new ethers.Contract(address, abi, wallet);
};

const recordOnChain = async (operationId, type, timestamp) => {
  try {
    if (!contract) initBlockchain();
    const tx = await contract.recordOperation(
      operationId,
      type,
      BigInt(timestamp)
    );
    await tx.wait();
    console.log("Recorded on chain:", tx.hash);
    return tx.hash;
  } catch (err) {
    console.error("Blockchain error:", err.message);
    return null;
  }
};

module.exports = { recordOnChain };
