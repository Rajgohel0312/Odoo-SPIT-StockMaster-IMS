const hre = require("hardhat");

async function main() {
  const StockLedger = await hre.ethers.getContractFactory("StockLedger");
  const ledger = await StockLedger.deploy();
  await ledger.deployed(); 
  console.log("StockLedger deployed to:", await ledger.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
