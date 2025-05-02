import { PinataSDK } from "pinata";
import axios from 'axios';

export const pinata = new PinataSDK({
  pinataJwt: process.env.REACT_APP_PINATA_JWT_KEY,
  pinataGateway: process.env.REACT_APP_PINATA_GATEWAY,
  pinataApiKey: process.env.REACT_APP_PINATA_API_KEY,
  pinataSecretApiKey: process.env.REACT_APP_PINATA_API_SECRET,
});

export async function unpinFile(hash) {
  const url = `https://api.pinata.cloud/pinning/unpin/${hash}`;
  try {
    const response = await axios.delete(url, {
      headers: {
        'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
        'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET,
      },
    });

    if (response.status === 200) {
      console.log(`Successfully removed pin: ${hash}`);
      return true;
    } else {
      console.error(`Failed to remove pin. Status code: ${response.status}`);
      console.error(response.data); // Log the response data for more details
      return false;
    }
  } catch (error) {
    console.error('Error unpinning file:', error.message);
    if (error.response) {
      console.error("Detailed error response:", error.response.data);
    }
    return false;
  }
}


// Simple function to upload string data to IPFS
export const uploadToIPFS = async (data, fileName = null) => {
  try {
    console.log(data, 'data');
    fileName = fileName ?? data.metaData.email;
    const file = new File([JSON.stringify(data)], `${fileName}.txt`);
    const upload = await pinata.upload.public.file(file);
    return {
      success: true,
      cid: upload.cid,
      url: `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${upload.cid}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Simple function to fetch string data from IPFS
export const fetchFromIPFS = async (cid) => {
  try {
    if ([null, undefined, ''].includes(cid)) throw new Error(`Invalid CID`);
    const file = await pinata.gateways.public.get(cid);
    return JSON.parse(file.data);
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error(`Fetch failed: ${error.message}`);
  }
};

export const checkForExistingUser = async (email) => {
  for await (const item of pinata.files.public.list().name(`${email}.txt`)) {
    return item;
  }
}

export const checkForExistingUserFromWalletId = async (walletId) => {
  for await (const item of pinata.files.public.list()) {
    const file = await pinata.gateways.public.get(item.cid);
    const data = JSON.parse(file.data);
    if (data.metaData.metaMaskId === walletId) {
      return item;
    }
  }
}

export const isIpfsCid = (hash) => {
  if (!hash || typeof hash !== 'string') return false;
  return isCIDv0(hash) || isCIDv1(hash);
};

function isCIDv0(hash) {
  return /^(Qm[1-9A-HJ-NP-Za-z]{44})$/.test(hash); // Corrected CIDv0 regex
}

function isCIDv1(hash) {
  return /^bafy[a-zA-Z0-9]{50,60}$/.test(hash); // Basic CIDv1 check
}

