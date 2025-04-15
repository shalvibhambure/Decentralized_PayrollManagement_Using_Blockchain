import React, { useState, useEffect } from 'react';
import { fetchFromIPFS } from '../utils/ipfs';
import { getContract } from '../utils/metamask-utils';
import PayrollABI from '../contracts/Payroll.json';
import Web3 from 'web3'; 

const contractAddress = '0xFf38A88263E8248497883fF0a5F808bD286DAa5B';

const EmployeeDashboard = ({ account }) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!account) {
          throw new Error('No wallet connected');
        }

        const web3 = new Web3(window.ethereum);
        const contract = getContract(web3, PayrollABI, contractAddress);
        
        const record = await contract.methods.employeeRequests(account).call();
        
        if (record.ipfsHash) {
          const ipfsData = await fetchFromIPFS(record.ipfsHash);
          setEmployeeData({
            ...record,
            ...ipfsData
          });
        } else {
          setEmployeeData(record);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!employeeData) return <div>No employee data found</div>;

  return (
    <div className="dashboard">
      <h2>Employee Dashboard</h2>
      <div>
        <p>Name: {employeeData.name || employeeData.fullName}</p>
        <p>Employee ID: {employeeData.employeeId}</p>
        <p>Email: {employeeData.email}</p>
        {employeeData.bankName && (
          <>
            <p>Bank: {employeeData.bankName}</p>
            <p>Account: {employeeData.accountNumber}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;