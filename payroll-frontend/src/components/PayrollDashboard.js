import React, { useState } from 'react';
import { getPayrollRecord } from '../utils/contract';
import { fetchFromIPFS } from '../utils/ipfs';

const PayrollDashboard = () => {
  const [recordId, setRecordId] = useState('');
  const [payrollData, setPayrollData] = useState('');

  const handleFetch = async () => {
    // Step 1: Get IPFS hash from the blockchain
    const record = await getPayrollRecord(recordId);
    const ipfsHash = record.ipfsHash;

    // Step 2: Fetch payroll data from IPFS
    const data = await fetchFromIPFS(ipfsHash);
    setPayrollData(data);
  };

  return (
    <div>
      <input
        type="text"
        value={recordId}
        onChange={(e) => setRecordId(e.target.value)}
        placeholder="Enter record ID"
      />
      <button onClick={handleFetch}>Fetch Payroll Data</button>
      <div>
        <h3>Payroll Data:</h3>
        <pre>{payrollData}</pre>
      </div>
    </div>
  );
};

export default PayrollDashboard;