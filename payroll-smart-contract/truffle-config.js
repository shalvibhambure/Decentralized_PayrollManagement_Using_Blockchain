module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,  // Default Ganache port
      network_id: "*",
      gas: 6721975,  // Set higher gas limit
      gasPrice: 20000000000  // 20 Gwei
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};