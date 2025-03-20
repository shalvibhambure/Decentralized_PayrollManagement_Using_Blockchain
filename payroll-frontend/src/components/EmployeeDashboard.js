import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import { registerEmployee } from '../utils/contract'; // Use registerEmployee instead of requestEmployeeRole
import { TextField, Button, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
          const walletAddress = accounts[0];

          // Check if the user is on the correct network
          const chainId = await provider.request({ method: 'eth_chainId' });
          const expectedChainId = '1337'; // Replace with your network's chain ID

          if (chainId !== expectedChainId) {
            setError(`Please switch to the correct network (Chain ID: ${expectedChainId}).`);
            return;
          }

          // Prepare employee data
          const employeeData = {
            name,
            employeeId,
            address,
            bankAccount,
          };

          // Upload employee data to IPFS
          const ipfsHash = JSON.stringify(employeeData); // Replace with actual IPFS upload logic if needed

          // Register employee with the IPFS hash
          await registerEmployee(ipfsHash);

          setIsSubmitted(true);
          setError('');
        } else {
          setError('No accounts found. Please create or unlock an account in MetaMask.');
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        if (error.code === 4001) {
          setError('User denied account access.');
        } else {
          setError('Failed to connect to MetaMask. Please try again.');
        }
      }
    } else {
      setError('Please install MetaMask to use this application.');
    }
    setLoading(false);
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Employee Registration
      </Typography>
      <form onSubmit={handleSubmit} style={styles.form}>
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Employee ID"
          variant="outlined"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Address"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Bank Account Number"
          variant="outlined"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          fullWidth
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitted || loading}
        >
          {loading ? <CircularProgress size={24} /> : isSubmitted ? 'Request Submitted' : 'Submit Request'}
        </Button>
      </form>
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '400px',
  },
};

export default EmployeeDashboard;