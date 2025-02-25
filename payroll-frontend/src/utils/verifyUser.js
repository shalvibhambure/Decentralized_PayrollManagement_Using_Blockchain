import detectEthereumProvider from '@metamask/detect-provider';
import { verifyUser } from './contract';

export const verifyUserRole = async () => {
  const provider = await detectEthereumProvider();

  if (provider) {
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        const isVerified = await verifyUser(userAddress);

        if (isVerified) {
          console.log('User is verified.');
          return userAddress;
        } else {
          console.log('User is not verified.');
          return null;
        }
      } else {
        console.log('No accounts found. Please create or unlock an account in MetaMask.');
        return null;
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      return null;
    }
  } else {
    console.log('Please install MetaMask to use this application.');
    return null;
  }
};