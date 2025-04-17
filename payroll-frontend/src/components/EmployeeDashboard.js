import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link
} from '@mui/material';
import { connectMetaMask } from '../utils/metamask-utils';
import PayrollABI from '../contracts/Payroll.json';
import Web3 from 'web3';
import { contractAddress } from '../constants';

const EmployeeDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Initialize Web3 and contract
  const initializeWeb3 = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask');

      const { web3, account } = await connectMetaMask();
      const contractInstance = new web3.eth.Contract(
        PayrollABI.abi,
        contractAddress
      );
      
      // FIRST set account, THEN other states
      setAccount(account); 
      setWeb3(web3);
      setContract(contractInstance);
      setInitialized(true);
      
      console.log('Web3 initialized with account:', account);
      return { contractInstance, account }; // Return both
    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      return null;
    }
  }, []);


  // Check if employee is approved
  const checkEmployeeAccess = useCallback(async (contractInstance, currentAccount) => {
    try {
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      const employeeDetails = await contractInstance.methods
        .getEmployeeDetails(currentAccount)
        .call();
      
      console.log('Employee details:', employeeDetails);
      
      if (!employeeDetails.exists || !employeeDetails.approved) {
        setAccessDenied(true);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Access check failed:', err);
      setError('Failed to verify employee status: ' + err.message);
      return false;
    }
  }, []);

  // Load employee data (preserving all existing functionality)
  const loadEmployeeData = useCallback(async (contractInstance, currentAccount) => {
    try {
      setLoading(true);
      
      // Verify access first
      const hasAccess = await checkEmployeeAccess(contractInstance, currentAccount);
      if (!hasAccess) return;

      console.log('Fetching employee data for:', currentAccount);
      
      // Fetch all data using currentAccount instead of account state
      const [record, salary, months] = await Promise.all([
        contractInstance.methods.getEmployeeDetails(currentAccount).call(),
        contractInstance.methods.getEmployeeSalaryDetails(currentAccount).call(),
        contractInstance.methods.getSalaryMonths(currentAccount).call()
      ]);

      // ... rest of your data loading logic ...
    } catch (err) {
      console.error('Data loading failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkEmployeeAccess]);

  // Main initialization effect
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const result = await initializeWeb3();
        if (!result) return;
        
        const { contractInstance, account } = result;
        await loadEmployeeData(contractInstance, account);
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        setError(err.message);
      }
    };

    initDashboard();
  }, [initializeWeb3, loadEmployeeData]);

  // Format ETH values (preserved from original)
  const formatEth = (val) => {
    try {
      return web3 ? web3.utils.fromWei(val.toString(), 'ether') : val;
    } catch {
      return val;
    }
  };

  // Loading state
  if (!initialized || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Your employee account is not yet approved. Please contact your administrator.
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!employeeData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No employee data found</Alert>
      </Box>
    );
  }

  // Main dashboard content (preserving all original display logic)
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Typography><strong>Name:</strong> {employeeData.name || employeeData.fullName}</Typography>
        <Typography><strong>Employee ID:</strong> {employeeData.employeeId}</Typography>
        <Typography><strong>Email:</strong> {employeeData.email}</Typography>
        {employeeData.bankName && (
          <>
            <Typography><strong>Bank:</strong> {employeeData.bankName}</Typography>
            <Typography><strong>Account:</strong> {employeeData.accountNumber}</Typography>
          </>
        )}
      </Paper>

      {salaryInfo && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Salary Information
          </Typography>
          <Typography><strong>Annual Salary:</strong> £{formatEth(salaryInfo.annual)}</Typography>
          <Typography><strong>Monthly Salary:</strong> £{formatEth(salaryInfo.monthly)}</Typography>
          <Typography><strong>Tax:</strong> £{formatEth(salaryInfo.tax)}</Typography>
          <Typography><strong>National Insurance:</strong> £{formatEth(salaryInfo.ni)}</Typography>
          <Typography><strong>Net Salary:</strong> £{formatEth(salaryInfo.net)}</Typography>
        </Paper>
      )}

      {payslips.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payslip History
          </Typography>
          <List>
            {payslips.map((slip) => (
              <ListItem key={slip.month}>
                <ListItemText
                  primary={`Month: ${slip.month}`}
                  secondary={slip.generated ? (
                    <Link 
                      href={`https://ipfs.io/ipfs/${slip.ipfsHash}`} 
                      target="_blank"
                      rel="noopener"
                    >
                      View Payslip
                    </Link>
                  ) : "Not generated yet"}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default EmployeeDashboard;