import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, CircularProgress, Snackbar, Alert, TextField, Tabs, Tab
} from '@mui/material';
import { fetchFromIPFS, isIpfsCid, uploadToIPFS, unpinFile } from '../utils/ipfs';
import Web3 from 'web3';
import { connectMetaMask } from '../utils/metamask-utils';
import { contractAddress } from '../constants';
import Payroll from '../contracts/Payroll.json';
import { id } from 'ethers';

const AdminDashboard = ({walletAddress}) => {
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
  
  const initWeb3 = async () => {
    try {
      const { web3, account } = await connectMetaMask();
      return web3;
    } catch (error) {
      throw new Error('Failed to connect: ' + error.message);
    }
  };


  const fetchPendingEmployees = useCallback (async () => {
    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      console.log('walletAddress:', walletAddress);
      const employees = await contract.methods.getPendingEmployees().call({from: walletAddress});
      console.log('Pending Employees:', employees);
      console.log({employees, contract, walletAddress});
      const tmp = await Promise.all(
        employees.map(async(employeeRow) => {
          const obj = await fetchFromIPFS(employeeRow.ipfsHash);
          return {
            address: obj.metaData.metaMaskId,
            name: obj.metaData.fullName || 'N/A',
            employeeId: obj.metaData.employeeId.toString() || 'N/A',
            email: obj.metaData.email || 'N/A',
          };
        })
      );
      setPendingEmployees(tmp.filter((detail) => detail !== null));
    } catch (error) {
      console.error('Error fetching pending employees:', error);
      setError('Failed to fetch pending admin requests.' + error.message);
    }
  }, [walletAddress]);


  const fetchApprovedEmployees = useCallback (async () => {
    try{
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const employees = await contract.methods.getApprovedEmployees().call({from: walletAddress});
      const employeeDetails = await Promise.all(
        employees.map(async (employeeRow) => {
          const obj = await fetchFromIPFS(employeeRow.ipfsHash);
          console.log({obj});
          return {
            address: obj.metaData.metaMaskId,
            name: obj.metaData.fullName || 'N/A',
            id: obj.metaData.employeeId || 'N/A',
            email: obj.metaData.email || 'N/A',
          };
        })
      );
      setApprovedEmployees(employeeDetails);
    }catch (error) {
      console.error('Error fetching approved employees:', error);
      setError('Failed to fetch approved admin requests.' + error.message);
    }
  }, [walletAddress]);


  const calculateSalaryPreview = (annualSalary1) => {
    if (!annualSalary1 || isNaN(annualSalary1)) return;
    const salary = parseFloat(annualSalary1);
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

  const handleApprove = useCallback (async () => {
    try {
      setLoading(true);
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      let existingData = {};
      let oldCid;
      console.log("Employee Details:", employeeDetails.ipfsHash, employeeDetails.email);
      console.log(isIpfsCid(employeeDetails.ipfsHash));
      console.log(employeeDetails.address);
        try {
          oldCid = employeeDetails.ipfsHash;
          const response = await fetchFromIPFS(employeeDetails.ipfsHash);
          existingData = typeof response === 'object' ? response.metaData : JSON.parse(response).metaData;
        } catch (ipfsError) {
          console.warn("Failed to fetch existing IPFS data:", ipfsError);
          return;
        }
      const updatedData = {
        metaData: {
          ...existingData,
        },
        salaryDetails: {
          annualSalary: annualSalary,
          monthlySalary: salaryPreview.monthly,
          taxRate: salaryPreview.tax,
          nationalInsuranceRate: salaryPreview.ni,
          netSalary: salaryPreview.net,
          approvedOn: new Date().toISOString()
        },
        status: "approved"
      };
      const deleted = await unpinFile(oldCid);
      if (!deleted) {
        setError('Failed to unpin old IPFS file.');
        return;
      }
      const uploadResult = await uploadToIPFS(updatedData, employeeDetails.email);
      const newIpfsHash = uploadResult.cid || uploadResult;
      console.log("New IPFS Hash:", newIpfsHash);
      if (!newIpfsHash) {
        throw new Error('Failed to get IPFS hash from upload');
      }
      console.log('employee details:', employeeDetails);
      await contract.methods.approveEmployee(
        employeeDetails.address,
        newIpfsHash
      ).send({ from: walletAddress });
      
      setSuccess('Employee approved with salary!');
      await fetchPendingEmployees();
      await fetchApprovedEmployees();
      setOpenDialog(false);
      setAnnualSalary('');
      setSalaryPreview(null);
    } catch (err) {
      const errorMsg = err.message.includes('string validation') 
        ? 'Invalid IPFS hash format. Please try again.'
        : err.message;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [employeeDetails, annualSalary, salaryPreview, fetchPendingEmployees, fetchApprovedEmployees, walletAddress]);


  const handleViewDetails = async (employee) => {
    try {
      setLoading(true);
      setError('');
      const employeeFromContract = await contract.methods.RegisterEmployees(employee.address).call();
      let ipfsData = {};
      let salaryDetails = {};
        try {
          const temp = (await fetchFromIPFS(employeeFromContract.ipfsHash));
          ipfsData = temp.metaData;
          salaryDetails = temp.salaryDetails;
        } catch (ipfsError) {
          console.warn("IPFS fetch failed:", ipfsError);
        }
      setEmployeeDetails({
        ...employeeFromContract,
        ...ipfsData,
        salaryDetails,
        address: employee.address,
        id: ipfsData.employeeId?.toString() || employeeFromContract.employeeId?.toString() || 'N/A', //  Check both
        name: ipfsData.fullName || employeeFromContract.name || 'N/A', 
        email: ipfsData.email || employeeFromContract.email || 'N/A', 
      });
      setOpenDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  };


  const handleReject = async (employeeAddress) => {
    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');
      await contract.methods.rejectAdmin(employeeAddress).send({ from: account });
      setSuccess('Employee rejected!');
      await fetchPendingEmployees();
    } catch (error) {
      setError('Failed to reject employee.'+error.message);
    } finally {
      setLoading(false); 
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await initWeb3();
        setWeb3(web3);
        const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
        setContract(contract);
        await fetchPendingEmployees(contract);
        await fetchApprovedEmployees(contract);
      } catch (error) {
        console.error("Dashboard init error:", error.message);
      }
    };
  
    init();
  }, [fetchPendingEmployees, fetchApprovedEmployees, walletAddress]);



























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
                    <TableCell>{employee.employeeId}</TableCell>
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
              {employeeDetails.salaryDetails && (
                <>
                  <hr />
                  <Typography variant="h6" gutterBottom>Salary Details</Typography>
                  <Typography><strong>Annual Salary:</strong> {employeeDetails.salaryDetails.annualSalary}</Typography>
                  <Typography><strong>Monthly Salary:</strong> {employeeDetails.salaryDetails.monthlySalary}</Typography>
                  <Typography><strong>Tax Rate:</strong> {employeeDetails.salaryDetails.taxRate}</Typography>
                  <Typography><strong>NI Rate:</strong> {employeeDetails.salaryDetails.nationalInsuranceRate}</Typography>
                  <Typography><strong>Net Salary:</strong> {employeeDetails.salaryDetails.netSalary}</Typography>
                  <Typography><strong>Approved On:</strong> {new Date(employeeDetails.salaryDetails.approvedOn).toLocaleDateString()}</Typography>
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
                      const value = e.target.value;
                      setAnnualSalary(value);
                      calculateSalaryPreview(value);
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