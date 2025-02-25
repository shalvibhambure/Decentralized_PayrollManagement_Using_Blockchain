import React, { useState } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import { addPayrollRecord } from '../utils/contract';

const PayrollForm = () => {
  const [employeeData, setEmployeeData] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Upload payroll data to IPFS
    const cid = await uploadToIPFS(employeeData);
    console.log('Data uploaded to IPFS with CID:', cid);

    // Step 2: Save IPFS hash on the blockchain
    await addPayrollRecord(cid, employeeAddress);
    console.log('Payroll record added to blockchain!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={employeeData}
        onChange={(e) => setEmployeeData(e.target.value)}
        placeholder="Enter payroll data"
      />
      <input
        type="text"
        value={employeeAddress}
        onChange={(e) => setEmployeeAddress(e.target.value)}
        placeholder="Enter employee address"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PayrollForm;