import React, { useState } from 'react';
import Web3 from 'web3'; // Import web3.js
import { Button, CircularProgress, Snackbar, Alert, Box, Typography, TextField } from '@mui/material';

// Replace with your contract ABI and address
import Payroll from '../contracts/Payroll.json';
// import Payroll from '../payroll-smart-contract/artifacts/contracts/Payroll.sol/Payroll.json'; // For Hardhat
const contractAddress = '0xC4a26d678dA43C7BaDbD54e2Ed263B81b28F9246'; // Replace with your contract address

const AdminRegistration = () => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize web3
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3;
    } else {
      throw new Error('Please install MetaMask.');
    }
  };

  // Handle admin registration request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const accounts = await web3.eth.getAccounts();
      const walletAddress = accounts[0];

      // Call the requestAdminRole function
      await contract.methods.requestAdminRole(name, employeeId, email).send({ from: walletAddress });
      setSuccess('Admin registration request submitted. Waiting for owner approval.');
      setError('');
    } catch (error) {
      console.error('Error submitting admin request:', error);
      setError('Failed to submit admin request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Admin Registration
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
          type="number"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Gmail"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Request'}
        </Button>
      </form>
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
          <Alert severity="success">{success}</Alert>
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
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '400px',
  },
};

export default AdminRegistration;