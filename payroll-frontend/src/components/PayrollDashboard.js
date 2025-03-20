import React, { useState } from 'react';
import { getPayrollRecord } from '../utils/contract';
import { fetchFromIPFS } from '../utils/ipfs';
import { TextField, Button, CircularProgress, Typography, Box } from '@mui/material';

const PayrollDashboard = () => {
  const [recordId, setRecordId] = useState('');
  const [payrollData, setPayrollData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);

    try {
      // Step 1: Get IPFS hash from the blockchain
      const record = await getPayrollRecord(recordId);
      const ipfsHash = record.ipfsHash;

      // Step 2: Fetch payroll data from IPFS
      const data = await fetchFromIPFS(ipfsHash);
      setPayrollData(data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    }
    setLoading(false);
  };

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Payroll Dashboard
      </Typography>
      <Box style={styles.form}>
        <TextField
          label="Record ID"
          variant="outlined"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Fetch Payroll Data'}
        </Button>
      </Box>
      {payrollData && (
        <Box style={styles.dataContainer}>
          <Typography variant="h6">Payroll Data:</Typography>
          <pre>{payrollData}</pre>
        </Box>
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
  dataContainer: {
    marginTop: '20px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
};

export default PayrollDashboard;