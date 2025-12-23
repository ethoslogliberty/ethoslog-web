const ethers = require("ethers");

async function main() {
  console.log("-----------------------------------------");
  console.log("Despliegue de Emergencia en Base Sepolia...");
  
  // PEGALA AQUÍ DIRECTAMENTE (solo esta vez)
  const pk = "21d51393252396009fe872a02f68892aa1d0fe7e86dbfdbc5c7af20e6104fde1"; 
  
  const artifact = require("../artifacts/contracts/EthosLog.sol/EthosLog.json");
  const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(pk, provider);

  console.log("Desplegando desde:", wallet.address);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("Enviando transacción...");
  const contract = await factory.deploy();

  console.log("Esperando confirmación...");
  await contract.deployed();

  console.log("-----------------------------------------");
  console.log("¡POR FIN! CONTRATO VIVO");
  console.log("Dirección:", contract.address);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});