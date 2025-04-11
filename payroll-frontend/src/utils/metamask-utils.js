import Web3 from 'web3';

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    //console.log("Signature:", accounts); // "0x..." (Copy this!)
    const web3 = new Web3(window.ethereum);
    
    return {
      web3,
      account: accounts[0]
    };
  } catch (error) {
    console.error('MetaMask connection failed:', error);
    throw new Error('Failed to connect: ' + error.message);
  }
};

export const getContract = (web3, contractABI, contractAddress) => {
  return new web3.eth.Contract(contractABI, contractAddress);
};