const hre = require("hardhat");

async function main() {
  console.log("Desplegando EthosLog V2 en Base Mainnet...");

  const EthosLog = await hre.ethers.getContractFactory("EthosLog");
  const ethos = await EthosLog.deploy();

  await ethos.waitForDeployment();

  console.log("¡CONTRATO DESPLEGADO!");
  console.log("Dirección del contrato:", await ethos.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});