const hre = require("hardhat");

async function main() {
  console.log("--- Iniciando despliegue de EthosLog en Base ---");

  // Obtener la cuenta que despliega
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando con la cuenta:", deployer.address);

  // Obtener el contrato
  const EthosLog = await hre.ethers.getContractFactory("EthosLog");
  
  console.log("Desplegando contrato...");
  const ethosLog = await EthosLog.deploy();

  // En ethers v6 esperamos a que se complete el despliegue así:
  await ethosLog.waitForDeployment();

  const address = await ethosLog.getAddress();
  
  console.log("-----------------------------------------");
  console.log("✅ Contrato Inmortalizado!");
  console.log("Dirección del contrato:", address);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });