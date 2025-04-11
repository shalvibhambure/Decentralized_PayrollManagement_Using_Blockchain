import Web3 from 'web3';

const web3 = new Web3('http://127.0.0.1:7545');

// The encoded result you provided represents an empty array
const encodedResult = "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000";

// For array types, you need to provide the full ABI definition
const abi = {
      "name": "getPendingEmployees",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
};

try {
    // Decode using the full ABI definition
    const decoded = web3.eth.abi.decodeParameter(abi.outputs[0].type, encodedResult);
    console.log(decoded); // Should show an empty array []
} catch (error) {
    console.error("Decoding failed:", error);
}