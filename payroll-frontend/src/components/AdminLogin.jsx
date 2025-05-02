import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { styles } from "../styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { connectMetaMask } from "../utils/metamask-utils";
import { checkForExistingUserFromWalletId, fetchFromIPFS } from "../utils/ipfs";

const AdminLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: loggedInUser, login } = useAuth();

  // Handle admin login
  const handleConnectToMetaMask = async () => {
    setLoading(true);

    try {
      const { account } = await connectMetaMask();

      const checkFile = await checkForExistingUserFromWalletId(account);
      if (checkFile) {
        const userData = await fetchFromIPFS(checkFile.cid);
        setLoginStorageKey(userData.metaData.name, checkFile.cid, account);
        navigate("/admin-dashboard");
      } else {
        setError("No admin data found. Please register first.");
      }
    } catch (error) {
      setError("Failed to connect: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setLoginStorageKey = (name, cid, walletAddress) => {
    if (name && cid) {
      login(JSON.stringify({ name, cid, walletAddress }));
    } else {
      throw new Error("Name & CID are required");
    }
  };

  useEffect(() => {
    if (loggedInUser) navigate("/admin-dashboard");
  }, []);
  return (
    <Box style={styles.container}>
      <Box style={styles.miniContainer}>
        <Typography variant="h4" gutterBottom>
          Admin Login
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectToMetaMask}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login with MetaMask"}
        </Button>
        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError("")}
          >
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default AdminLogin;
