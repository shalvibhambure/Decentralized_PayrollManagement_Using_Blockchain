import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.REACT_APP_PINATA_JWT_KEY,
  pinataGateway: process.env.REACT_APP_PINATA_GATEWAY,
});

// Simple function to upload string data to IPFS
export const uploadToIPFS = async (data, fileName = null) => {
  try {
    fileName = fileName ?? data.metaData.email;
    const file = new File([JSON.stringify(data)], `${fileName}.txt`);
    const upload = await pinata.upload.public.file(file);
    //console.log(upload);
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
    console.log({cid});
    if ([null, undefined, ''].includes(cid)) throw new Error(`Invalid CID`);
    const file = await pinata.gateways.public.get(cid);
    // console.log({file});
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

// Simple CID validation (basic check)
export const isIpfsCid = (hash) => {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
};

// Example usage:
// const result = await uploadStringToIPFS("Hello IPFS!");
// const data = await fetchStringFromIPFS(result.cid);