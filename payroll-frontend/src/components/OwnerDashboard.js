import React, { useState } from 'react';
import { approveAdmin } from '../utils/contract';
import { verifyUserRole } from '../utils/verifyUser';

const OwnerDashboard = () => {
  const [adminAddress, setAdminAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApproveAdmin = async () => {
    const ownerAddress = await verifyUserRole();

    if (ownerAddress) {
      try {
        await approveAdmin(adminAddress, ownerAddress);
        setSuccess(`Admin ${adminAddress} approved.`);
        setError('');
      } catch (error) {
        console.error('Error approving admin:', error);
        setError('Failed to approve admin. Please try again.');
        setSuccess('');
      }
    } else {
      alert('You are not authorized to perform this action.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Owner Dashboard</h1>
      <p>Welcome, Owner!</p>

      <div style={styles.form}>
        <input
          type="text"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
          placeholder="Enter admin address"
        />
        <button onClick={handleApproveAdmin}>Approve Admin</button>
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
    backgroundColor: '#ffccbc',
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

export default OwnerDashboard;