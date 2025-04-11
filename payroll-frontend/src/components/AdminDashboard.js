import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, CircularProgress, Snackbar, Alert, TextField, Tabs, Tab
} from '@mui/material';
import { fetchFromIPFS, isIpfsCid } from '../utils/ipfs';
import Web3 from 'web3';
import PayrollABI from '../contracts/Payroll.json';
import { connectMetaMask } from '../utils/metamask-utils';

const contractAddress = '0xa78Bc2aaE615F1F03E6643f71b291cfDd2FA8B84';

const AdminDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [approvedEmployees, setApprovedEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [salaryPreview, setSalaryPreview] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Initialize Web3 and contract
  const initializeWeb3 = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask');
      
      const { web3, account } = await connectMetaMask();
      const contractInstance = new web3.eth.Contract(
        PayrollABI.abi,
        contractAddress
      );
      
      setWeb3(web3);
      setContract(contractInstance);
      setAccount(account);
      return contractInstance;
    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      return null;
    }
  }, []);

  // Load pending employees with their details (Updated version)
  const loadPendingEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const contractInstance = contract || await initializeWeb3();
      if (!contractInstance) return;
  
      const pendingAddresses = await contractInstance.methods.getPendingEmployees().call();
      
      const employeesWithDetails = await Promise.all(
        pendingAddresses.map(async (address) => {
          try {
            const contractData = await contractInstance.methods.employeeRequests(address).call();
            
            const employee = {
              address,
              id: contractData.employeeId?.toString() || 'N/A',
              name: contractData.name || 'N/A',
              email: contractData.email || 'N/A',
              approved: contractData.approved || false
            };

            if (contractData.ipfsHash && contractData.ipfsHash.startsWith('Qm')) {
              try {
                const ipfsData = await fetchFromIPFS(contractData.ipfsHash);
                return { ...employee, ...ipfsData };
              } catch (ipfsError) {
                console.warn(`IPFS fetch failed for ${address}:`, ipfsError);
                return employee;
              }
            }
            return employee;
          } catch (err) {
            console.error(`Error loading employee ${address}:`, err);
            return {
              address,
              id: 'Error',
              name: 'Error loading',
              email: 'Error loading',
              approved: false
            };
          }
        })
      );
  
      setPendingEmployees(employeesWithDetails.filter(e => !e.approved));
    } catch (err) {
      console.error('Failed to load pending employees:', err);
      setError('Failed to load employee data. Check contract connection.');
    } finally {
      setLoading(false);
    }
  }, [contract, initializeWeb3]);

  // Load approved employees with their details
  const loadApprovedEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const contractInstance = contract || await initializeWeb3();
      if (!contractInstance) return;

      const approvedAddresses = await contractInstance.methods.getApprovedEmployees().call();
      const employeesWithDetails = await Promise.all(
        approvedAddresses.map(async (address) => {
          try {
            const result = await contractInstance.methods.employeeRequests(address).call();
            
            let additionalDetails = {};
            if (result.ipfsHash && !result.ipfsHash.includes('pending')) {
              try {
                additionalDetails = await fetchFromIPFS(result.ipfsHash);
              } catch (ipfsError) {
                console.warn(`IPFS fetch failed for ${address}:`, ipfsError);
              }
            }

            return {
              address,
              id: result.employeeId.toString(),
              name: result.name,
              email: result.email,
              ...additionalDetails,
              approved: result.approved
            };
          } catch (err) {
            console.error(`Error loading approved employee ${address}:`, err);
            return {
              address,
              id: 'Error',
              name: 'Error loading',
              email: 'Error loading',
              approved: true
            };
          }
        })
      );
      
      setApprovedEmployees(employeesWithDetails);
    } catch (err) {
      console.error('Failed to load approved employees:', err);
      setError('Failed to load approved employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, initializeWeb3]);

  // View employee details
  // Update your handleViewDetails function
  const handleViewDetails = async (employee) => {
    try {
      setLoading(true);
      setError('');
    
      const contractData = await contract.methods.employeeRequests(employee.address).call();
    
      let ipfsData = {};
      if (contractData.ipfsHash && isIpfsCid(contractData.ipfsHash)) {
        try {
          ipfsData = await fetchFromIPFS(contractData.ipfsHash);
        } catch (ipfsError) {
          console.warn("IPFS fetch failed:", ipfsError);
        }
      }

      setEmployeeDetails({
        ...contractData,
        ...ipfsData,
        address: employee.address,
        id: contractData.employeeId.toString()
      });
      setOpenDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Make sure to always set loading to false
    }
  };

  // Calculate salary preview in pounds
  const calculateSalaryPreview = () => {
    if (!annualSalary || isNaN(annualSalary)) return;
    const salary = parseFloat(annualSalary);
    const monthly = salary / 12;
    const tax = (monthly * 20) / 100;
    const ni = (monthly * 12) / 100;
    const net = monthly - tax - ni;
    
    setSalaryPreview({
      monthly: monthly.toFixed(2),
      tax: tax.toFixed(2),
      ni: ni.toFixed(2),
      net: net.toFixed(2)
    });
  };

  // Approve employee with salary in pounds
  const handleApprove = async () => {
    try {
      setLoading(true);
      if (!contract || !web3) throw new Error('Contract not initialized');
      
      // Convert pounds to wei (1 GBP = 1 ETH for simplicity)
      const salaryInWei = web3.utils.toWei(annualSalary, 'ether');
      
      await contract.methods.approveEmployee(
        employeeDetails.address,
        salaryInWei
      ).send({ from: account });
      
      setSuccess('Employee approved with salary!');
      await loadPendingEmployees();
      await loadApprovedEmployees();
      setOpenDialog(false);
      setAnnualSalary('');
      setSalaryPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reject employee
  // Update your handleReject function
  const handleReject = async (employeeAddress) => {
    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');
    
      await contract.methods.rejectEmployee(employeeAddress)
        .send({ from: account });
    
      setSuccess('Employee rejected!');
      await loadPendingEmployees();
  } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Ensure loading is always reset
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      const contractInstance = await initializeWeb3();
      if (!contractInstance) return;
      
      await loadPendingEmployees();
      await loadApprovedEmployees();
    };

    initialize();
  }, [initializeWeb3, loadPendingEmployees, loadApprovedEmployees]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending Employees" />
        <Tab label="Approved Employees" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Typography variant="h6" gutterBottom>Pending Employees</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingEmployees.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                    <Button 
                      variant="contained"
                      onClick={() => handleViewDetails(employee)}
                      disabled={loading}
                      sx={{ 
                        mr: 1,
                        '&:disabled': {
                          opacity: 0.7,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(employee.address)}
                      disabled={loading}
                      sx={{
                        '&:disabled': {
                          opacity: 0.7,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      Reject
                    </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Typography variant="h6" gutterBottom>Approved Employees</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedEmployees.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained"
                        onClick={() => handleViewDetails(employee)}
                        disabled={loading}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm">
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {employeeDetails && (
            <Box sx={{ p: 2 }}>
              <Typography><strong>ID:</strong> {employeeDetails.id}</Typography>
              <Typography><strong>Name:</strong> {employeeDetails.name}</Typography>
              <Typography><strong>Email:</strong> {employeeDetails.email}</Typography>
              <Typography><strong>Address:</strong> {employeeDetails.address}</Typography>
              
              {/* Display additional IPFS data if available */}
              {employeeDetails.bankName && (
                <>
                  <Typography><strong>Bank:</strong> {employeeDetails.bankName}</Typography>
                  <Typography><strong>Account:</strong> {employeeDetails.accountNumber}</Typography>
                </>
              )}

              <Typography><strong>Status:</strong> {employeeDetails.approved ? 'Approved' : 'Pending'}</Typography>
              
              {!employeeDetails.approved && (
                <>
                  <TextField
                    label="Annual Salary (£)"
                    fullWidth
                    margin="normal"
                    value={annualSalary}
                    onChange={(e) => {
                      setAnnualSalary(e.target.value);
                      calculateSalaryPreview();
                    }}
                    type="number"
                    inputProps={{ step: "0.01" }}
                  />

                  {salaryPreview && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="subtitle1">Salary Breakdown (Monthly):</Typography>
                      <Typography>Gross: £{salaryPreview.monthly}</Typography>
                      <Typography>Tax (20%): £{salaryPreview.tax}</Typography>
                      <Typography>NI (12%): £{salaryPreview.ni}</Typography>
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Net Salary: £{salaryPreview.net}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {!employeeDetails?.approved && (
            <Button 
              onClick={handleApprove}
              color="primary"
              disabled={loading || !annualSalary}
            >
              {loading ? <CircularProgress size={24} /> : 'Approve with Salary'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {loading && <CircularProgress sx={{ mt: 3 }} />}
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;