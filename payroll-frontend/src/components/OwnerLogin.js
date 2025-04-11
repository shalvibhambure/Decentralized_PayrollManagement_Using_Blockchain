import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3'; // Import web3.js
import { Button, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';
import { connectMetaMask } from '../utils/metamask-utils';

// Replace with your contract ABI and address
import Payroll from '../contracts/Payroll.json'; // For Truffle
// import Payroll from '../payroll-smart-contract/artifacts/contracts/Payroll.sol/Payroll.json'; // For Hardhat
const contractAddress = '0xa78Bc2aaE615F1F03E6643f71b291cfDd2FA8B84'; // Replace with your contract address

const OwnerLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize web3 and contract
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Explicitly request account access
      return web3;
    } else {
      throw new Error('Please install MetaMask.');
    }
  };

  // Handle owner login
  const handleLogin = async () => {
    setLoading(true);
  
    try {
      const { web3, account } = await connectMetaMask();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      
      const isOwner = await contract.methods.verifyOwner(account).call();
      if (isOwner) {
        navigate('/owner-dashboard', { state: { walletAddress: account } });
      } else {
        setError('You are not the owner.');
      }
    } catch (error) {
      setError('Failed to connect: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Owner Login
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Login with MetaMask'}
      </Button>
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
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    padding: '20px',
  },
};

export default OwnerLogin;