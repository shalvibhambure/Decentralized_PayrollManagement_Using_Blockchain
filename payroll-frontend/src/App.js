import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import OwnerLogin from './components/OwnerLogin';
import OwnerDashboard from './components/OwnerDashboard';
import EmployeeRegistration from './components/EmployeeRegistration';
import AdminRegistration from './components/AdminRegistration';
import SecureLayout from './layouts/SecureLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login-employee" element={<EmployeeDashboard />} />
        <Route path="/login-admin" element={<AdminDashboard />} />
        <Route path="/login-owner" element={<OwnerLogin />} />
        <Route path="/register-employee" element={<EmployeeRegistration />} />
        <Route path="/register-admin" element={<AdminRegistration />} />
        {/* Secure Routes */}
        <Route path="/owner-dashboard" element={<SecureLayout Page={OwnerDashboard} />} />
      </Routes>
    </Router>
  );
};

export default App;