import Web3 from 'web3';
const web3 = new Web3('http://127.0.0.1:7545');

// 1. Get real encoded data from contract call
const encodedData = await web3.eth.call({
  to: "0x062D2DFd976A8a5E5DBcEc4FE8c46a782A5f5D91",
  data: web3.eth.abi.encodeFunctionCall({
    name: "getPendingEmployees",
    type: "function",
    inputs: []
  }, [])
});

// 2. Decode properly
const abi = {
  "inputs": [],
  "name": "getPendingEmployees",
  "outputs": [{"type": "address[]"}],
  "stateMutability": "view",
  "type": "function"
};

const decoded = web3.eth.abi.decodeParameters(
  abi.outputs, 
  encodedData
)[0];

console.log(decoded); // Will show [] or actual addresses