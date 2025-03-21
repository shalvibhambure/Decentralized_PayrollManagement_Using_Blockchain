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
    return cid.toString(); // Return the CID (Content Identifier)
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

// Function to fetch data from IPFS
export const fetchFromIPFS = async (cid) => {
  try {
    const stream = ipfs.cat(cid);
    let data = [];

    for await (const chunk of stream) {
      // Collect raw bytes
      data.push(...chunk);
    }

    // Convert raw bytes to a UTF-8 string
    const jsonString = String.fromCharCode(...data);
    console.log('Decoded JSON String:', jsonString);

    // Parse the JSON data
    const parsedData = JSON.parse(jsonString);
    return parsedData;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};