import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const WelcomePage = () => {
  return (
    <Container style={styles.container}>
      <Typography variant="h2" gutterBottom>
        Welcome to Payroll Management System
      </Typography>
      <Box style={styles.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login-employee"
          style={styles.button}
        >
          Login as Employee
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login-admin"
          style={styles.button}
        >
          Login as Admin
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/register-employee"
          style={styles.button}
        >
          Register as Employee
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/register-admin"
          style={styles.button}
        >
          Register as Admin
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/login-owner"
          style={styles.button}
        >
          Login as Owner
        </Button>
      </Box>
    </Container>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    padding: '20px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    width: '200px',
  },
};

export default WelcomePage;