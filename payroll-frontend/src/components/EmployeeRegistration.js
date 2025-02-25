import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import { requestEmployeeRole } from '../utils/contract';

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          await requestEmployeeRole(name, employeeId, address, bankAccount, walletAddress);
          setIsSubmitted(true);
          setError('');
        } else {
          setError('No accounts found. Please create or unlock an account in MetaMask.');
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setError('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      setError('Please install MetaMask to use this application.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Employee Registration</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Employee ID"
          required
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
        />
        <input
          type="text"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          placeholder="Bank Account Number"
          required
        />
        <button type="submit" disabled={isSubmitted}>
          {isSubmitted ? 'Request Submitted' : 'Submit Request'}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
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
    backgroundColor: '#f0f0f0',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default EmployeeRegistration;