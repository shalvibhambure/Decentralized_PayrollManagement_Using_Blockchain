import Web3 from 'web3'; // ES module import

// Load ABI from JSON file
import PayrollABI from '../contracts/Payroll.json' with { type: 'json' };

// Set up Web3 instance (connect to your Ganache RPC or any Ethereum node)
const web3 = new Web3('http://127.0.0.1:7545'); // Ganache RPC URL

// Your contract address
const contractAddress = '0xFf38A88263E8248497883fF0a5F808bD286DAa5B';

// Create a contract instance
const contract = new web3.eth.Contract(PayrollABI.abi, contractAddress);

// Function to encode ABI for a given function and parameters
const encodeFunctionData = (functionName, params) => {
  try {
    const encodedData = contract.methods[functionName](...params).encodeABI();
    console.log(`Encoded ABI for ${functionName}: ${encodedData}`);
    return encodedData;
  } catch (error) {
    console.error(`Error encoding function data: ${error.message}`);
  }
};

// Example: Encoding the `getPendingEmployees` function
encodeFunctionData('getPendingEmployees', []);
