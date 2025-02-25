import React, { useState } from 'react';
import { approveEmployee } from '../utils/contract';
import { verifyUserRole } from '../utils/verifyUser';

const AdminDashboard = () => {
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApproveEmployee = async () => {
    const adminAddress = await verifyUserRole();

    if (adminAddress) {
      try {
        await approveEmployee(employeeAddress, adminAddress);
        setSuccess(`Employee ${employeeAddress} approved.`);
        setError('');
      } catch (error) {
        console.error('Error approving employee:', error);
        setError('Failed to approve employee. Please try again.');
        setSuccess('');
      }
    } else {
      alert('You are not authorized to perform this action.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Administrator Dashboard</h1>
      <p>Welcome, Administrator!</p>

      <div style={styles.form}>
        <input
          type="text"
          value={employeeAddress}
          onChange={(e) => setEmployeeAddress(e.target.value)}
          placeholder="Enter employee address"
        />
        <button onClick={handleApproveEmployee}>Approve Employee</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
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
    backgroundColor: '#ffe0b2',
    padding: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
};

export default AdminDashboard;