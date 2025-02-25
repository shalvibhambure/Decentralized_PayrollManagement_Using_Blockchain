import { create } from 'ipfs-http-client';

// Connect to IPFS (Infura or local node)
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export const uploadToIPFS = async (data) => {
  const { cid } = await ipfs.add(data);
  return cid.toString();
};

export const fetchFromIPFS = async (cid) => {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
};