import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import PdfTextFinder from './test';
import ConfirmationLetter from './temp';

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
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Define placeholders with approximate positions for the PDF template
    const placeholders = [
      { text: record.reference, x: 100, y: 700 },      // Position for {{reference}}
      { text: record.date, x: 300, y: 700 },           // Position for {{date}}
      { text: record.name, x: 120, y: 650 },           // Position for {{name}}
      { text: record.gender, x: 120, y: 630 },         // Position for {{gender}}
      { text: record.fathername, x: 120, y: 610 },     // Position for {{fathername}}
      { text: record.rollno, x: 120, y: 590 },         // Position for {{rollno}}
      { text: record.phone, x: 120, y: 570 },          // Position for {{phone}}
      { text: record.startingdate, x: 120, y: 550 },   // Position for {{startingdate}}
      { text: record.course, x: 120, y: 530 },         // Position for {{course}}
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
    return blob;
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
    // <PdfTextFinder />
    <ConfirmationLetter/>
    // <div>
    //   <h2>PDF Modifier</h2>
    //   <input
    //     type="file"
    //     accept=".xlsx"
    //     onChange={(e) => setExcelFile(e.target.files[0])}
    //   />
    //   <input
    //     type="file"
    //     accept=".pdf"
    //     onChange={(e) => setPdfFile(e.target.files[0])}
    //   />
    //   <button onClick={processFiles} disabled={loading}>
    //     {loading ? 'Generating PDFs...' : 'Generate PDF'}
    //   </button>
    // </div>
  );
};

export default PdfModifier;
