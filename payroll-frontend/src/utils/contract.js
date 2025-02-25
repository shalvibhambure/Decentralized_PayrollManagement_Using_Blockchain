import web3 from './web3';
import contractABI from '../contracts/Payroll.json';

const contractAddress = '0x76acD96b989115CB5542156ae016568B5b4b9Db2'; // Replace with your contract address
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

export const requestEmployeeRole = async (name, employeeId, address, bankAccount, walletAddress) => {
  await contract.methods.requestEmployeeRole(name, employeeId, address, bankAccount).send({ from: walletAddress });
};

export const requestAdminRole = async (name, employeeId, walletAddress) => {
  await contract.methods.requestAdminRole(name, employeeId).send({ from: walletAddress });
};

export const approveEmployee = async (employeeAddress, adminAddress) => {
  await contract.methods.approveEmployee(employeeAddress).send({ from: adminAddress });
};

export const approveAdmin = async (adminAddress, ownerAddress) => {
  await contract.methods.approveAdmin(adminAddress).send({ from: ownerAddress });
};

export const getPayrollRecord = async (recordId, userAddress) => {
  return await contract.methods.getPayrollRecord(recordId).call({ from: userAddress });
};

export const verifyUser = async (userAddress) => {
  return await contract.methods.verifyUser(userAddress).call();
};