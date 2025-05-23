import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { Button, Snackbar, Alert, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFromIPFS, isIpfsCid } from '../utils/ipfs';
// Update the import path to match your project structure
import Payroll from '../contracts/Payroll.json'; // For Truffle
import { connectMetaMask } from '../utils/metamask-utils';
// import Payroll from '../payroll-smart-contract/artifacts/contracts/Payroll.sol/Payroll.json'; // For Hardhat
import { contractAddress } from '../constants';
import useAuth from '../hooks/useAuth';
import { styles } from '../styles';

const OwnerDashboard = ({ walletAddress }) => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [adminDetails, setAdminDetails] = useState([]); // Store admin details
  const [approvedAdmins, setApprovedAdmins] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  

  // Initialize web3 and contract
  const initWeb3 = async () => {
    try {
      const { web3, account } = await connectMetaMask();
      return web3;
    } catch (error) {
      throw new Error('Failed to connect: ' + error.message);
    }
  };
  
  // Fetch admin details (name, employee ID, email) for each pending admin
  const fetchAdminDetails = useCallback(async (adminAddress) => {
    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const adminRequest = await contract.methods.getPendingAdmin().call({ from: walletAddress });
  
      // Handle IPFS data if present
      let additionalDetails = {};
      if (adminRequest.ipfsHash && isIpfsCid(adminRequest.ipfsHash)) {
        try {
          additionalDetails = (await fetchFromIPFS(adminRequest.ipfsHash)).metaData;
        } catch (ipfsError) {
          console.error('Error fetching IPFS data:', ipfsError);
        }
      }
  
      return {
        address: adminAddress,
        name: adminRequest.name || 'N/A',
        employeeId: adminRequest.employeeId ? adminRequest.employeeId.toString() : 'N/A',
        email: adminRequest.email || 'N/A',
        ...additionalDetails
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
      const tmp = await Promise.all(
        admins.map(async (adminRow) => {
          const obj = await fetchFromIPFS(adminRow.ipfsHash);
          // const name = await contract.methods.adminNames(adminRow).call();
          // const employeeId = await contract.methods.adminEmployeeIds(adminRow).call();
          // const email = await contract.methods.adminEmails(adminRow).call();
          return {
            address: obj.metaData.metaMaskId,
            name: obj.metaData.name || 'N/A',
            employeeId: obj.metaData.employeeId.toString() || 'N/A',
            email: obj.metaData.email || 'N/A',
          };
        })
      );
  
      console.log('Admin Details:', tmp); // Log the fetched admin details
  
      setPendingAdmins(admins);
      setAdminDetails(tmp.filter((detail) => detail !== null));
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      setError('Failed to fetch pending admin requests.'+ error.message);
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
      fetchApprovedAdmins();
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
      fetchApprovedAdmins();
    } catch (error) {
      setError('Failed to reject admin.'+error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedAdmins = useCallback(async () => {
    try {
      const web3 = await initWeb3();
      const contract = new web3.eth.Contract(Payroll.abi, contractAddress);
      const admins = await contract.methods.getApprovedAdmins().call({ from: walletAddress });
      console.log('my Approved Admins:', admins); // Log the fetched approved admin addresses
      // Fetch details for each approved admin
      const adminDetails = await Promise.all(
        admins.map(async (adminRow) => {
          // console.log({adminRow, hash: adminRow.ipfsHash});
          const obj = await fetchFromIPFS(adminRow.ipfsHash);
          // const name = await contract.methods.adminNames(adminRow).call();
          // const employeeId = await contract.methods.adminEmployeeIds(adminRow).call();
          // const email = await contract.methods.adminEmails(adminRow).call();
          return {
            address: obj.metaData.metaMaskId,
            name: obj.metaData.name || 'N/A',
            employeeId: obj.metaData.employeeId.toString() || 'N/A',
            email: obj.metaData.email || 'N/A',
          };
        })
      );
  
      setApprovedAdmins(adminDetails);
    } catch (error) {
      console.error('Error fetching approved admins:', error);
      setError('Failed to fetch approved admins requests.'+ error.message);
    }
  }, [walletAddress]);


  // Fetch pending admins on component mount
  useEffect(() => {
    if (!walletAddress) {
      navigate('/owner-login');
    } else {
      fetchPendingAdmins();
      fetchApprovedAdmins(); // Fetch approved admins
    }
  }, [walletAddress, navigate, fetchPendingAdmins, fetchApprovedAdmins]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
  
      {/* Pending Admin Requests */}
      <Typography variant="h6">Pending Admin Requests</Typography>
      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
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
  
      {/* Approved Admins */}
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Approved Admins
      </Typography>
      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedAdmins.length > 0 ? (
              approvedAdmins.map((admin, index) => (
                <TableRow key={index}>
                  <TableCell>{admin.employeeId}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.address}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No approved admins.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  
      {/* Error and Success Messages */}
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
    </>
  );
};

export default OwnerDashboard;