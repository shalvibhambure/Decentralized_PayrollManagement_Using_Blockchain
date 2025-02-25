import React, { useState } from 'react';
import { getPayrollRecord } from '../utils/contract';
import { verifyUserRole } from '../utils/verifyUser';

const EmployeeDashboard = () => {
  const [recordId, setRecordId] = useState('');
  const [payrollData, setPayrollData] = useState('');

  const handleFetch = async () => {
    const userAddress = await verifyUserRole();

    if (userAddress) {
      const record = await getPayrollRecord(recordId, userAddress);
      setPayrollData(record);
    } else {
      alert('You are not authorized to perform this action.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Employee Dashboard</h1>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#e0f7fa',
  },
};

export default EmployeeDashboard;