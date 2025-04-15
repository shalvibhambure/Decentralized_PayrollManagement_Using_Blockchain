import React, { useState } from 'react';
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
  CardContent
} from '@mui/material';
import { connectMetaMask, getContract } from '../utils/metamask-utils';
import { uploadToIPFS } from '../utils/ipfs';
import Web3 from 'web3';
import PayrollABI from '../contracts/Payroll.json';

const contractAddress = '0xFf38A88263E8248497883fF0a5F808bD286DAa5B';

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [account, setAccount] = useState('');

  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      const { account } = await connectMetaMask();
      setAccount(account);
      setSuccess('Wallet connected successfully!');
    } catch (error) {
      setError(error.message);
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
      // Validate form
      if (!formData.fullName || !formData.employeeId || !formData.email ) {
        throw new Error('Please fill all fields');
      }

      const response = await uploadToIPFS({
        ...formData,
        role: 'employee',
        registrationDate: new Date().toISOString()
      });
      
      if (response.success) {

        const web3 = new Web3(window.ethereum);
        const contract = getContract(web3, PayrollABI.abi, contractAddress);

        await contract.methods.registerEmployee(
          formData.fullName,
          formData.employeeId,
          formData.email,
          response.cid
        ).send({ from: account });
    
        setSuccess('Registration successful!');
        //setTimeout(() => navigate('/employee-dashboard'), 2000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
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
            Employee Registration
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
                  name="fullName"
                  fullWidth
                  margin="normal"
                  value={formData.fullName}
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
                  {loading ? <CircularProgress size={24} /> : 'Register'}
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

export default EmployeeRegistration;