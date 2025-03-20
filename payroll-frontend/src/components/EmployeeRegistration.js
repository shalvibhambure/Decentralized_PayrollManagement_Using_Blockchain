import React, { useState } from 'react';
import { registerEmployee } from '../utils/contract'; // Import registerEmployee
import { uploadToIPFS } from '../utils/ipfs'; // Import IPFS upload function
import { TextField, Button, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';

const EmployeeRegistration = () => {
  const [fullName, setFullName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to proceed.');
        return;
      }

      // Step 2: Prepare employee data
      const employeeData = {
        fullName,
        bankName,
        accountNumber,
        sortCode,
        email,
        phoneNumber,
        address,
        employeeId,
      };

      // Step 3: Upload employee data to IPFS
      const ipfsHash = await uploadToIPFS(JSON.stringify(employeeData));

      // Step 4: Register employee with the IPFS hash
      await registerEmployee(ipfsHash);

      setSuccess('Employee registration request submitted. Waiting for admin approval.');
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to submit employee registration. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Employee Registration
      </Typography>
      <form onSubmit={handleSubmit} style={styles.form}>
        <TextField
          label="Full Name"
          variant="outlined"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Bank Name"
          variant="outlined"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Account Number"
          variant="outlined"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Sort Code"
          variant="outlined"
          value={sortCode}
          onChange={(e) => setSortCode(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Phone Number"
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
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
          label="Employee ID"
          variant="outlined"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
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
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '400px',
  },
};

export default EmployeeRegistration;