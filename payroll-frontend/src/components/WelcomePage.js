import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  return (
    <div style={styles.container}>
      <h1>Welcome to Payroll Management System</h1>
      <Link to="/login-employee" style={styles.button}>
        Login as Employee
      </Link>
      <Link to="/login-admin" style={styles.button}>
        Login as Admin
      </Link>
      <Link to="/register-employee" style={styles.button}>
        Register as Employee
      </Link>
      <Link to="/register-admin" style={styles.button}>
        Register as Admin
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  button: {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'white',
    backgroundColor: '#007bff',
    borderRadius: '5px',
  },
};

export default WelcomePage;