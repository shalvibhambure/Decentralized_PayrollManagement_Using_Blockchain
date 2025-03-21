import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { Button, Snackbar, Alert, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
// Update the import path to match your project structure
import Payroll from '../contracts/Payroll.json'; // For Truffle
// import Payroll from '../payroll-smart-contract/artifacts/contracts/Payroll.sol/Payroll.json'; // For Hardhat

const contractAddress = '0xE4909B4C948e6b225009598879fFdca819ad85AC'; // Replace with your contract address

const OwnerDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [adminDetails, setAdminDetails] = useState([]); // Store admin details
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const walletAddress = location.state?.walletAddress;

  // Initialize web3 and contract
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Updated method
      return web3;
    } else {
      throw new Error('Please install MetaMask.');
    }
  };
  
  // Fetch admin details (name, employee ID, email) for each pending admin
  const fetchAdminDetails = useCallback(async (adminAddress) => {
    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const adminRequest = await contract.methods.adminRequests(adminAddress).call();

      // Debugging: Log the adminRequest object
      console.log('Admin Request:', adminRequest);

      return {
        address: adminAddress,
        name: adminRequest.name || 'N/A', // Fallback for missing name
        employeeId: adminRequest.employeeId ? adminRequest.employeeId.toString() : 'N/A', // Convert to string
        email: adminRequest.email || 'N/A', // Fallback for missing email
      };
    } catch (error) {
      console.error('Error fetching admin details:', error);
      return null;
    }
  }, []);

  // Fetch pending admins and their details
  const fetchPendingAdmins = useCallback(async () => {
    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const admins = await contract.methods.getPendingAdmins().call({ from: walletAddress });

      // Fetch details for each admin
      const adminDetails = await Promise.all(
        admins.map(async (adminAddress) => {
          return await fetchAdminDetails(adminAddress);
        })
      );

      // Filter out null or invalid entries
      const validAdminDetails = adminDetails.filter((detail) => detail !== null);

      // Debugging: Log the validAdminDetails array
      console.log('Valid Admin Details:', validAdminDetails);

      setPendingAdmins(admins);
      setAdminDetails(validAdminDetails); // Set only valid admin details
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      setError('Failed to fetch pending admin requests.');
    }
  }, [walletAddress, fetchAdminDetails]);

  // Approve an admin request
  const handleApproveAdmin = async (adminAddress) => {
    setLoading(true);

    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      await contract.methods.approveAdmin(adminAddress).send({ from: walletAddress });
      setSuccess(`Admin ${adminAddress} approved.`);
      fetchPendingAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error approving admin:', error);
      setError('Failed to approve admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reject an admin request
  const handleRejectAdmin = async (adminAddress) => {
    setLoading(true);

    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      await contract.methods.rejectAdmin(adminAddress).send({ from: walletAddress });
      setSuccess(`Admin ${adminAddress} rejected.`);
      fetchPendingAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting admin:', error);
      setError('Failed to reject admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Fetch pending admins on component mount
  useEffect(() => {
    if (!walletAddress) {
      navigate('/owner-login');
    } else {
      fetchPendingAdmins();
    }
  }, [walletAddress, navigate, fetchPendingAdmins]);

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
      <Typography variant="h6">Pending Admin Requests</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminDetails.length > 0 ? (
              adminDetails.map((admin, index) => (
                <TableRow key={index}>
                  <TableCell>{admin.employeeId}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApproveAdmin(admin.address)}
                      disabled={loading}
                      style={{ marginRight: '10px' }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRejectAdmin(admin.address)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending admin requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
};

export default OwnerDashboard;