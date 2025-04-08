import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadToIPFS } from './ipfs';

export const generatePayslipPDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    // ... existing PDF generation code ...

    const pdfBytes = await pdfDoc.save();
    
    try {
        // Upload PDF to IPFS
        const { cid, url } = await uploadToIPFS(pdfBytes);
        
        return {
            cid,
            url,
            pdfBytes // Optional: keep bytes for immediate download
        };
    } catch (error) {
        console.error('Failed to upload payslip to IPFS:', error);
        throw error;
    }
};