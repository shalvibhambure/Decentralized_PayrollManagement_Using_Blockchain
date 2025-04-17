import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import Web3 from 'web3';
import { connectMetaMask } from '../utils/metamask-utils';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <Container style={styles.container}>
      <Typography variant="h2" gutterBottom style={styles.title}>
        Welcome to Payroll Management System
      </Typography>
      <Typography variant="subtitle1" gutterBottom style={styles.subtitle}>
        Blockchain-powered payroll solution
      </Typography>
      
      <Box style={styles.buttonContainer}>
        {/* Employee Login with MetaMask connection */}
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login-employee"
          style={styles.button}
          size="large"
        >
          Login as Employee
        </Button>

        {/* Other login/register options */}
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login-admin"
          style={styles.button}
          size="large"
        >
          Login as Admin
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/register-employee"
          style={styles.button}
          size="large"
        >
          Register as Employee
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/register-admin"
          style={styles.button}
          size="large"
        >
          Register as Admin
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/login-owner"
          style={styles.button}
          size="large"
        >
          Login as Owner
        </Button>
      </Box>

      {/* Status notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#555',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    maxWidth: '300px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    textTransform: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
  },
};

export default WelcomePage;