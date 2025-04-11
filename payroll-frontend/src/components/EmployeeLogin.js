import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  CircularProgress, 
  Snackbar, 
  Alert, 
  Box, 
  Typography,
  Card,
  CardContent,
  Link
} from '@mui/material';
import { connectMetaMask } from '../utils/metamask-utils';
import PayrollABI from '../contracts/Payroll.json';
import Web3 from 'web3';

const contractAddress = '0xa78Bc2aaE615F1F03E6643f71b291cfDd2FA8B84';

const EmployeeLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      setLoading(true);
      const { account } = await connectMetaMask();
      setWalletAddress(account);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      if (!employeeId) {
        throw new Error('Please enter your employee ID');
      }

      const web3 = new Web3(window.ethereum);
      const payrollContract = new web3.eth.Contract(PayrollABI.abi, contractAddress);
      
      // Check if employee is registered
      const isApproved = await payrollContract.methods.isApprovedEmployee(walletAddress).call();
      
      if (!isApproved) {
        throw new Error('Employee not registered or approved');
      }

      // Verify employee ID matches
      const storedId = await payrollContract.methods.employeeIds(walletAddress).call();
      if (storedId !== employeeId) {
        throw new Error('Invalid employee ID');
      }

      navigate('/employee-dashboard', { 
        state: { 
          walletAddress,
          employeeId 
        } 
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.container}>
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Employee Login
          </Typography>
          
          {!walletAddress ? (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Connect Wallet'}
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="success.main" gutterBottom>
                Connected: {`${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`}
              </Typography>
              
              <form onSubmit={handleLogin}>
                <TextField
                  label="Employee ID"
                  fullWidth
                  margin="normal"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    p: 2
  },
  card: {
    maxWidth: 450,
    width: '100%'
  }
};

export default EmployeeLogin;