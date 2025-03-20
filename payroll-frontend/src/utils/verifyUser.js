import detectEthereumProvider from '@metamask/detect-provider';
import { verifyUser } from './contract';

export const verifyUserRole = async () => {
  const provider = await detectEthereumProvider();

  if (provider) {
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];

        // Check if the user is on the correct network
        const chainId = await provider.request({ method: 'eth_chainId' });
        const expectedChainId = '0x539'; // Replace with your network's chain ID

        if (chainId !== expectedChainId) {
          console.error(`Please switch to the correct network (Chain ID: ${expectedChainId}).`);
          return null;
        }

        const isVerified = await verifyUser(walletAddress);

        if (isVerified) {
          console.log('User is verified.');
          return walletAddress;
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