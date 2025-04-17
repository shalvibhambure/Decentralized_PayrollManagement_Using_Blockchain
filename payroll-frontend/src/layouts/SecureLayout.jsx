import { Box } from '@mui/material';
import { styles } from '../styles';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const SecureLayout = ({ Page }) => {
    const navigate = useNavigate();
    const {data: loggedInUser, logout} = useAuth();
    
    const handleLogout = (e) => {
      e.preventDefault();
      if (window.confirm('You are about to logout. Are you sure?')) {
        logout();
        navigate('/');
      }
    }

    useEffect(() => {
        if (!loggedInUser) {
            navigate('/?relogin=true');
        }
    }, []);

    return (
        <Box style={styles.secureContainer}>
            <Box style={styles.header}>
                <strong>Payroll Management System</strong>
                <Box sx={{ ml: 'auto' }}>
                <span style={{ marginRight: '5px' }}>
                    Welcome {loggedInUser?.name}!
                </span>
                <span>(</span>
                <a href="#" onClick={handleLogout}>Logout</a>
                <span>)</span>
                </Box>
            </Box>
            <Box style={{ padding: '20px' }}>
                <Page walletAddress={loggedInUser.walletAddress} />
            </Box>
        </Box>
    );
}

export default SecureLayout;