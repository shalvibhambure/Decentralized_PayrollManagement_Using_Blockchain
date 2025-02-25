import Web3 from 'web3';

// Connect to Ganache (local blockchain) or MetaMask (Ethereum mainnet/testnet)
const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');

export default web3;