import React, { useState, useEffect } from 'react';
import { getPendingEmployees, getApprovedEmployees, getEmployeeDetails, approveEmployee, rejectEmployee } from '../utils/contract';
import { fetchFromIPFS } from '../utils/ipfs';
import { Button, CircularProgress, Snackbar, Alert, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';

const AdminDashboard = () => {
  const [employeeRequests, setEmployeeRequests] = useState([]);
  const [approvedEmployees, setApprovedEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const fetchEmployeeRequests = async () => {
    try {
      const requests = await getPendingEmployees();
      setEmployeeRequests(requests);
    } catch (error) {
      console.error('Error fetching employee requests:', error);
      setError('Failed to fetch employee requests.');
    }
  };

  const fetchApprovedEmployees = async () => {
    try {
      const approved = await getApprovedEmployees();
      setApprovedEmployees(approved);
    } catch (error) {
      console.error('Error fetching approved employees:', error);
      setError('Failed to fetch approved employees.');
    }
  };

  const handleViewDetails = async (employeeAddress) => {
    try {
      const details = await getEmployeeDetails(employeeAddress);
      const data = await fetchFromIPFS(details.ipfsHash);
      setEmployeeDetails(data);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError('Failed to fetch employee details.');
    }
  };

  const handleApprove = async (employeeAddress) => {
    setLoading(true);
    try {
      await approveEmployee(employeeAddress);
      setSuccess('Employee approved successfully.');
      fetchEmployeeRequests(); // Refresh the list
      fetchApprovedEmployees(); // Refresh the approved list
    } catch (error) {
      console.error('Error approving employee:', error);
      setError('Failed to approve employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (employeeAddress) => {
    setLoading(true);
    try {
      await rejectEmployee(employeeAddress);
      setSuccess('Employee rejected successfully.');
      fetchEmployeeRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting employee:', error);
      setError('Failed to reject employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchEmployeeRequests();
    fetchApprovedEmployees();
  }, []);

  return (
    <Box style={styles.container}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Pending Requests" />
        <Tab label="Approved Employees" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Typography variant="h6">Pending Employee Requests</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Address</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeRequests.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell>{request}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(request)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleReject(request)}
                        disabled={loading}
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
          <Typography variant="h6">Approved Employees</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Address</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedEmployees.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewDetails(employee)}
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

      {/* Employee Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {employeeDetails && (
            <Box>
              <Typography><strong>Name:</strong> {employeeDetails.fullName}</Typography>
              <Typography><strong>Employee ID:</strong> {employeeDetails.employeeId}</Typography>
              <Typography><strong>Email:</strong> {employeeDetails.email}</Typography>
              <Typography><strong>Bank Name:</strong> {employeeDetails.bankName}</Typography>
              <Typography><strong>Account Number:</strong> {employeeDetails.accountNumber}</Typography>
              <Typography><strong>Sort Code:</strong> {employeeDetails.sortCode}</Typography>
              <Typography><strong>Phone Number:</strong> {employeeDetails.phoneNumber}</Typography>
              <Typography><strong>Address:</strong> {employeeDetails.address}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default AdminDashboard;