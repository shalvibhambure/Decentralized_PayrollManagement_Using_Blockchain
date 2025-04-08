import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { connectMetaMask, getContract } from '../utils/metamask-utils';
import { uploadToIPFS } from '../utils/ipfs';
import PayrollABI from '../contracts/Payroll.json';
import Web3 from 'web3';

const contractAddress = '0xef5e2be84aC41491A64166c6489E057d3CF085cB';

const AdminRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: ''
  });
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      const { account } = await connectMetaMask();
      setAccount(account);
      setSuccess('Wallet connected successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload to IPFS
      const response = await uploadToIPFS({
        ...formData,
        role: 'admin',
        registrationDate: new Date().toISOString()
      });

      if (response.success) {
        // 2. Get contract instance
        const web3 = new Web3(window.ethereum);
        const contract = getContract(web3, PayrollABI.abi, contractAddress);
  
        // 3. Register admin request
        await contract.methods.requestAdminRole(
          formData.name,
          formData.employeeId,
          formData.email,
          response.cid
        ).send({ from: account });
  
        setSuccess('Admin registration request submitted!');
      } else {
        setError(response.message);
      }

    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      p: 2
    }}>
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Admin Registration
          </Typography>

          {!account ? (
            <Box textAlign="center" mt={2}>
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
                Connected: {`${account.substring(0, 6)}...${account.slice(-4)}`}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Employee ID"
                  name="employeeId"
                  fullWidth
                  margin="normal"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  type="email"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register as Admin'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRegistration;