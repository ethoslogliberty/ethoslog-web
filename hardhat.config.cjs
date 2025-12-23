require("@nomicfoundation/hardhat-toolbox");

// BORRA la parte de dotenv y la constante de ceros por un momento
module.exports = {
  solidity: "0.8.19",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      // PON TU CLAVE AQUÍ ENTRE COMILLAS (Con o sin 0x, prueba primero como la tengas en MetaMask)
      accounts: ["yourkey"], 
    }
  }
};