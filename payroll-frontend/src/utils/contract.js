import Web3 from 'web3';
import Payroll from '../contracts/Payroll.json'; // Import your contract ABI

const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545'); // Replace with your Ganache RPC URL
const contractAddress = '0xE4909B4C948e6b225009598879fFdca819ad85AC'; // Replace with your contract address
const contract = new web3.eth.Contract(Payroll.abi, contractAddress); // Use the full ABI

// Initialize Web3
const initWeb3 = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
    return web3;
  } else {
    throw new Error('Please install MetaMask.');
  }
};

// Initialize contract instance
const initContract = async () => {
  const web3 = await initWeb3();
  return new web3.eth.Contract(Payroll.abi, contractAddress); // Use the full ABI from Payroll.json
};

// Function to request admin role
export const requestAdminRole = async (name, employeeId, email) => {
  try {
    const contract = await initContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    await contract.methods
      .requestAdminRole(name, employeeId, email)
      .send({ from: walletAddress });
  } catch (error) {
    console.error('Error requesting admin role:', error);
    throw error;
  }
};

// Function to approve admin
export const approveAdmin = async (adminAddress) => {
  try {
    const contract = await initContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    await contract.methods
      .approveAdmin(adminAddress)
      .send({ from: walletAddress });
  } catch (error) {
    console.error('Error approving admin:', error);
    throw error;
  }
};

// Function to register employee
export const registerEmployee = async (ipfsHash) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    // Increase the gas limit (e.g., 500,000 gas)
    const gasLimit = 500000;

    await contract.methods
      .registerEmployee(ipfsHash)
      .send({ from: walletAddress, gas: gasLimit });
  } catch (error) {
    console.error('Error registering employee:', error);
    throw error;
  }
};

// Function to get pending employee requests
export const getPendingEmployees = async () => {
  try {
    const contract = await initContract();
    const requests = await contract.methods
      .getPendingEmployees()
      .call();
    return requests;
  } catch (error) {
    console.error('Error fetching pending employees:', error);
    throw error;
  }
};

// Function to get employee details
export const getEmployeeDetails = async (employeeAddress) => {
  try {
    const contract = await initContract();
    const details = await contract.methods
      .getEmployeeDetails(employeeAddress)
      .call();
    return details;
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error;
  }
};

// Function to reject an employee request
export const rejectEmployee = async (employeeAddress) => {
  try {
    const contract = await initContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    await contract.methods
      .rejectEmployee(employeeAddress)
      .send({ from: walletAddress });
  } catch (error) {
    console.error('Error rejecting employee:', error);
    throw error;
  }
};

// Function to approve employee
export const approveEmployee = async (employeeAddress) => {
  try {
    const contract = await initContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    await contract.methods
      .approveEmployee(employeeAddress)
      .send({ from: walletAddress });
  } catch (error) {
    console.error('Error approving employee:', error);
    throw error;
  }
};

// Function to add a payroll record
export const addPayrollRecord = async (recordId, ipfsHash, employee) => {
  try {
    const contract = await initContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    await contract.methods
      .addPayrollRecord(recordId, ipfsHash, employee)
      .send({ from: walletAddress });
  } catch (error) {
    console.error('Error adding payroll record:', error);
    throw error;
  }
};

// Function to get payroll record
export const getPayrollRecord = async (recordId) => {
  try {
    const contract = await initContract();
    const record = await contract.methods
      .getPayrollRecord(recordId)
      .call();
    return record;
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    throw error;
  }
};

// Function to get approved employees
export const getApprovedEmployees = async () => {
  try {
    const contract = await initContract();
    const approvedEmployees = await contract.methods
      .getApprovedEmployees()
      .call();
    return approvedEmployees;
  } catch (error) {
    console.error('Error fetching approved employees:', error);
    throw error;
  }
};