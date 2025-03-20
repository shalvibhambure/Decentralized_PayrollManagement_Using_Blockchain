import React, { useState } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import { addPayrollRecord } from '../utils/contract';
import { TextField, Button, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';

const PayrollForm = () => {
  const [employeeData, setEmployeeData] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Upload payroll data to IPFS
      const cid = await uploadToIPFS(employeeData);
      console.log('Data uploaded to IPFS with CID:', cid);

      // Step 2: Save IPFS hash on the blockchain
      await addPayrollRecord(cid, employeeAddress);
      setSuccess('Payroll record added successfully!');
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add payroll record. Please try again.');
      setSuccess('');
    }
    setLoading(false);
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Add Payroll Record
      </Typography>
      <form onSubmit={handleSubmit} style={styles.form}>
        <TextField
          label="Payroll Data"
          variant="outlined"
          multiline
          rows={4}
          value={employeeData}
          onChange={(e) => setEmployeeData(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Employee Address"
          variant="outlined"
          value={employeeAddress}
          onChange={(e) => setEmployeeAddress(e.target.value)}
          fullWidth
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
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

export default PayrollForm;