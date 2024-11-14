import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

const PdfModifier = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to read data from the Excel file
  const readExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return rows.map(row => ({
      name: row[0],
      reference: row[1],
      date: row[2],
      gender: row[3],
      fathername: row[4],
      rollno: row[5],
      phone: row[6],
      startingdate: row[7],
      course: row[8]  // Assuming `course` as an additional column in your Excel
    }));
  };

  // Function to modify PDF by overlaying text at specified positions
  const modifyPdfWithPlaceholders = async (pdfFile, record) => {
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Set page size to A4 (595 x 842 points)
      firstPage.setSize(595, 842);
  
      // Confirm the dimensions by getting width and height
      const { width, height } = firstPage.getSize();
      console.log(`Dimensions of PDF set to A4: ${width} x ${height}`);
  
      // Define placeholders with approximate positions for the PDF template
      const placeholders = [
        { text: record.reference, x: 450, y: 800 },
        { text: record.date, x: 300, y: 700 },
        { text: record.name, x: 120, y: 650 },
        { text: record.gender, x: 120, y: 630 },
        { text: record.fathername, x: 120, y: 610 },
        { text: record.rollno, x: 120, y: 590 },
        { text: record.phone, x: 120, y: 570 },
        { text: record.startingdate, x: 120, y: 550 },
        { text: record.course, x: 120, y: 530 },
      ];
  
      // Overlay text for each placeholder at the specified coordinates
      placeholders.forEach(({ text, x, y }) => {
        firstPage.drawText(text, {
          x,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      });
  
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  
      // Print the size of the modified PDF file in bytes
      console.log(`Size of modified PDF file: ${blob.size} bytes`);
  
      return blob;
    } catch (error) {
      console.error('Error modifying PDF:', error);
    }
  };
  

  // Function to handle file processing and download
  const processFiles = async () => {
    if (!excelFile || !pdfFile) {
      alert("Please upload both Excel and PDF files");
      return;
    }

    setLoading(true);
    const records = await readExcelFile(excelFile);

    for (const record of records) {
      const modifiedPdfBlob = await modifyPdfWithPlaceholders(pdfFile, record);
      downloadPdf(modifiedPdfBlob, `${record.name}_Document.pdf`);
    }

    setLoading(false);
  };

  // Helper function to download the modified PDF
  const downloadPdf = (blob, filename) => {
    saveAs(blob, filename);
  };

  return (
    <div>
      <h2>PDF Modifier</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setExcelFile(e.target.files[0])}
      />
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
      />
      <button onClick={processFiles} disabled={loading}>
        {loading ? 'Generating PDFs...' : 'Generate PDF'}
      </button>
    </div>
  );
};

export default PdfModifier;
