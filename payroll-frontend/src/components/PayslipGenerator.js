import { PDFDocument, rgb } from 'pdf-lib';
import { uploadToIPFS } from './ipfs';

export const generatePayslipPDF = async (employeeData, salaryRecord) => {
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    
    // Add content
    const { font } = await pdfDoc.embedFont('Helvetica');
    page.drawText('PAYSLIP', { x: 150, y: 550, size: 20, font });
    page.drawText(`Employee: ${employeeData.name}`, { x: 50, y: 500, size: 12, font });
    page.drawText(`Month: ${salaryRecord.yearMonth}`, { x: 50, y: 480, size: 12, font });
    page.drawText(`Gross: ${salaryRecord.grossSalary} ETH`, { x: 50, y: 460, size: 12, font });
    page.drawText(`Tax: ${salaryRecord.taxAmount} ETH`, { x: 50, y: 440, size: 12, font });
    page.drawText(`NI: ${salaryRecord.niAmount} ETH`, { x: 50, y: 420, size: 12, font });
    page.drawText(`Net: ${salaryRecord.netSalary} ETH`, { x: 50, y: 400, size: 12, font, color: rgb(0, 0.5, 0) });

    // Save and upload to IPFS
    const pdfBytes = await pdfDoc.save();
    const ipfsHash = await uploadToIPFS(pdfBytes);
    return ipfsHash;
};