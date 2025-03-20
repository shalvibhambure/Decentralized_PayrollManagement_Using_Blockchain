import Web3 from 'web3';

// Function to initialize web3
const initWeb3 = async () => {
  if (window.ethereum) {
    // Modern dapp browsers (e.g., MetaMask)
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3;
    } catch (error) {
      console.error('User denied account access:', error);
      throw new Error('User denied account access.');
    }
  } else if (window.web3) {
    // Legacy dapp browsers
    const web3 = new Web3(window.web3.currentProvider);
    return web3;
  } else {
    // No Ethereum provider detected
    throw new Error('Please install MetaMask or another Ethereum provider.');
  }
};