import { create } from 'ipfs-http-client';

// Connect to the local IPFS node
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
});

// Function to upload data to IPFS
export const uploadToIPFS = async (data) => {
  try {
    const { cid } = await ipfs.add(data);
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload data to IPFS.');
  }
};

// Function to fetch data from IPFS
export const fetchFromIPFS = async (cid) => {
  try {
    const stream = ipfs.cat(cid);
    let data = '';
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    return data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch data from IPFS.');
  }
};