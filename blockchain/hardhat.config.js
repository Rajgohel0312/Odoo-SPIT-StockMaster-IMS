require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    local: {
      url: process.env.BLOCKCHAIN_RPC || "http://127.0.0.1:8545",
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY].filter(Boolean),
    },
  },
};
