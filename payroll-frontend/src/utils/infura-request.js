import Web3 from 'web3';

// Replace with your Infura endpoint
const INFURA_URL = 'https://mainnet.infura.io/v3/c8176ca2174a424ab27e5e5fac5de04a';

// Correct way to initialize Web3 with a provider in modern versions
const web3 = new Web3(INFURA_URL); // Simplified syntax

async function getBlockNumber() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Latest block:', blockNumber);
  } catch (error) {
    console.error('Error:', error);
  }
}

getBlockNumber();