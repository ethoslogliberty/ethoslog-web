require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Creamos una variable segura para que no dé error si alguna red no tiene la clave
const privateKey = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: "0.8.19",
  networks: {
    // ESTA ES LA QUE NECESITAMOS AHORA
    base: {
      url: "https://mainnet.base.org",
      accounts: [privateKey],
      },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [privateKey],
    },
    mainnet: {
      url: "https://eth.llamarpc.com", 
      accounts: [privateKey],
    }
  },
  etherscan: {
    // Para Base se usa Basescan, pero Hardhat lo maneja con esta misma sección
    apiKey: {
      base: process.env.BASESCAN_API_KEY || ""
    }
  }
};