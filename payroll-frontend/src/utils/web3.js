import Web3 from 'web3';

let web3Instance = null;

export const initWeb3 = async () => {
  if (web3Instance) return web3Instance;

  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3Instance = new Web3(window.ethereum);
      
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed:', accounts[0]);
      });
      
      return web3Instance;
    } catch (error) {
      throw new Error(`User denied access: ${error.message}`);
    }
  } else {
    throw new Error('Non-Ethereum browser detected. Install MetaMask');
  }
};

export const getWeb3 = () => {
  if (!web3Instance) throw new Error('Web3 not initialized');
  return web3Instance;
};