import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Snackbar, Alert, Box, Typography, TextField } from '@mui/material';
import { connectMetaMask } from '../utils/metamask-utils';

// Replace with your contract ABI and address
import Payroll from '../contracts/Payroll.json'; // For Truffle
// import Payroll from '../payroll-smart-contract/artifacts/contracts/Payroll.sol/Payroll.json'; // For Hardhat
import { contractAddress } from '../constants';
import { checkForExistingUser, uploadToIPFS, fetchFromIPFS } from '../utils/ipfs';
import { styles } from '../styles';
import useAuth from '../hooks/useAuth';

const OwnerLogin = () => {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: loggedInUser, login } = useAuth();

  // Handle owner login
  const handleConnectToMetaMask = async () => {
    setLoading(true);
  
    try {
      const { web3, account } = await connectMetaMask();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      
      const isOwner = await contract.methods.isOwner(account).call();
      if (isOwner) {
        const checkFile = await checkForExistingUser('owner');
        if (checkFile) {
          const userData = await fetchFromIPFS(checkFile.cid);
          setLoginStorageKey(userData.metaData.name, checkFile.cid, account);
          navigate('/owner-dashboard');
        } else {
          setAccountId(account);
        }
      } else {
        setError('You are not the owner.');
      }
    } catch (error) {
      setError('Failed to connect: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = {
        metaData: {
          name: name,
          role: "owner",
          metaMaskId: accountId,
          createdDate: new Date().toISOString()
        }
      };
      const { cid } = await uploadToIPFS(data, "owner");
      setLoginStorageKey(name, cid, accountId);
      navigate('/owner-dashboard');
    } catch (error) {
      console.log(error);
      setError('Error saving owner information');
    } finally {
      setLoading(false);
    }
  }

  const setLoginStorageKey = (name, cid, walletAddress) => {
    if (name && cid) {
      login(JSON.stringify({ name, cid, walletAddress }));
    } else {
      throw new Error('Name & CID are required');
    }
  }

  useEffect(() => {
    if (loggedInUser) navigate('/owner-dashboard');
  }, []);

  return (
    <Box style={styles.container}>
      <Box style={styles.miniContainer}>
        <Typography variant="h4" gutterBottom>
          Owner Login
        </Typography>
        {accountId ? (
          <>
            <Alert severity='info'>Please enter your name as you're are logging in for the first time.</Alert>
            <TextField 
              variant="outlined"
              placeholder="Write here"
              label="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              sx={{ width: '100%', backgroundColor: '#fff' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={loading}
            >
              Continue to Dashboard
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnectToMetaMask}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login with MetaMask'}
          </Button>
        )}
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default OwnerLogin;