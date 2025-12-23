require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19", // Mantengo tu versión 0.8.19
  networks: {
    // Tu red de pruebas actual
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
    },
    // NUEVA: Red Principal de Ethereum
    "mainnet": {
      url: process.env.RPC_URL_MAINNET || "https://eth.llamarpc.com", 
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  // ESTO ES LO QUE FALTA PARA LA VERIFICACIÓN
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};