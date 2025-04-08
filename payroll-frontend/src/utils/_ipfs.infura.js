import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Hardcoded credentials (replace with your actual Infura credentials)
const projectId = 'c8176ca2174a424ab27e5e5fac5de04a'; // Replace this
const projectSecret = '+bd5z2qgN+ecZSIMtIs0pT/NbVEfQhGE7a3/MXnywPsTXcwO7yjz/A'; // Replace this

const auth = Buffer.from(`${projectId}:${projectSecret}`).toString('base64');

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${auth}`
  },
  // apiPath: '/c8176ca2174a424ab27e5e5fac5de04a/+bd5z2qgN+ecZSIMtIs0pT/NbVEfQhGE7a3/MXnywPsTXcwO7yjz/A'
});

// Simple function to upload string data to IPFS
export const uploadToIPFS = async (data) => {
  try {
    const { cid } = await ipfsClient.add(JSON.stringify(data));
    console.log({ cid });
    return {
      cid: cid.toString(),
      url: `https://ipfs.infura.io/ipfs/${cid}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Simple function to fetch string data from IPFS
export const fetchFromIPFS = async (cid) => {
  try {
    const stream = ipfsClient.cat(cid);
    let chunks = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks).toString();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error(`Fetch failed: ${error.message}`);
  }
};

// Simple CID validation (basic check)
export const isIpfsCid = (hash) => {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
};

// Example usage:
// const result = await uploadStringToIPFS("Hello IPFS!");
// const data = await fetchStringFromIPFS(result.cid);