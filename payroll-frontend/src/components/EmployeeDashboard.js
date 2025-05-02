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
import Payroll from '../contracts/Payroll.json';
import Web3 from 'web3';
import { contractAddress } from '../constants';
import { fetchFromIPFS } from '../utils/ipfs';

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

  const initializeWeb3 = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask');

      const { web3, account } = await connectMetaMask();
      const contractInstance = new web3.eth.Contract(Payroll.abi,contractAddress);
      
      setAccount(account); 
      setWeb3(web3);
      setContract(contractInstance);
      setInitialized(true);
      
      console.log('Web3 initialized with account:', account);
      return { contractInstance, account }; 
    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      return null;
    }
  }, []);


  const getEmployeeDetails = useCallback(async (contractInstance, currentAccount) => {
    try {
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      const employeeDetails = await contractInstance.methods.getEmployee(currentAccount).call();
      
      console.log('Employee details:', employeeDetails);
      
      if (!employeeDetails.approved) {
        setAccessDenied(true);
        console.log('adas');
        return { access: false, error: 'Employee is not approved' };
      }
      return { access: true, data: employeeDetails };
    } catch (err) {
      console.error('Access check failed:', err);
      setError('Failed to verify employee status: ' + err.message);
      return { access: false, error: 'Failed to verify employee status'};
    }
  }, []);

  const loadEmployeeData = useCallback(async (contractInstance, currentAccount) => {
    try {
      setLoading(true);

      const { access: hasAccess, data: employeeRawData } = await getEmployeeDetails(contractInstance, currentAccount);
      if (!hasAccess) return;

      const employeeDetails = await fetchFromIPFS(employeeRawData.ipfsHash);
      
      console.log('Fetching employee data for:', {currentAccount, employeeDetails});
      
      setEmployeeData(employeeDetails.metaData);
      setSalaryInfo(employeeDetails.salaryDetails);

      
    } catch (err) {
      console.error('Data loading failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getEmployeeDetails]);

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

  if (!initialized || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Typography><strong>Name:</strong> {employeeData.fullName}</Typography>
        <Typography><strong>Employee ID:</strong> {employeeData.employeeId}</Typography>
        <Typography><strong>Email:</strong> {employeeData.email}</Typography>
      </Paper>

      {salaryInfo && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Salary Information
          </Typography>
          <Typography><strong>Annual Salary:</strong> £{salaryInfo.annualSalary}</Typography>
          <Typography><strong>Monthly Salary:</strong> £{salaryInfo.monthlySalary}</Typography>
          <Typography><strong>Tax:</strong> £{salaryInfo.taxRate}</Typography>
          <Typography><strong>National Insurance:</strong> £{salaryInfo.nationalInsuranceRate}</Typography>
          <Typography><strong>Net Salary:</strong> £{salaryInfo.netSalary}</Typography>
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