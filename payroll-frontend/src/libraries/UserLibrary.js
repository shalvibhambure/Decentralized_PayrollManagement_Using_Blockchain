import { uploadToIPFS, checkForExistingUser } from "../utils/ipfs";
export const registerUser = async (data) => {
    try {
        const check = await checkForExistingUser(data.email);
        if (check) {
            return {
                success: false,
                message: 'User already exists, please login'
            }
        } else {
            return await uploadToIPFS(data);
        }
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}