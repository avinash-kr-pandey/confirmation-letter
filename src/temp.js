import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ConfirmationLetter.css";

const ConfirmationLetter = () => {
  const [data, setData] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        setData(rows);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadAllPDFs = async () => {
    for (const studentData of data) {
      setCurrentStudent(studentData);  // Update the displayed student data
      await new Promise((resolve) => setTimeout(resolve, 100));  // Allow React to render

      const input = document.getElementById("confirmation-letter");
      if (!input) {
        console.warn(`Element not found for student: ${studentData.rollno}`);
        continue;
      }

      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${studentData.name}_ConfirmationLetter.pdf`);
    }

    setCurrentStudent(null);  // Clear after processing
  };

  return (
    <div className="app-container">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {data.length > 0 && (
        <div>
          <button onClick={downloadAllPDFs}>Download All PDFs</button>
          {currentStudent && (
            <div id="confirmation-letter" className="confirmation-container">
              {/* Header with Logos */}
              <div className="header">
                <img src="/image.png" alt="Hoping Minds Logo" className="logo" />
              </div>

              {/* Main Content with Border */}
              <div className="main-content">
                <div className="reference-date">
                  <p>Ref: HM/IL/2023-2024/{currentStudent.reference}</p>
                  <p>Date: {currentStudent.date}</p>
                </div>

                <div className="address">
                  <p>To,</p>
                  <p>The Head of the Department</p>
                  <p>Electronics & Communication Engineering</p>
                  <p>Punjabi University (Patiala)</p>
                </div>

                <p className="subject">Subject: Training Confirmation Letter.</p>

                <p>Dear Ma’am/Sir,</p>
                <p className="greeting">Greetings from Hoping Minds!!</p>
                <p className="body-text">
                Hoping Minds is a holistic development program to help programming job aspirants get their dream careers at zero financial risks. We have set out to create an interactive, gamified and rewarding program of development that is personalized to individuals and structured as per corporate requirements. We have been active in the Counselling, Training & Placement ecosystem since 2013 and have helped 12,000+ students realise their dream careers. Our goal is to bridge the gap between corporate requirements and student skillsets to build a World of possibilities for students, expedite the growth of corporates and bring about a revolution in the existing educational system.
                </p>
                <p className="body-text">
                  We are glad to confirm Your Student <span style={{fontWeight:"bold"}}>{currentStudent.name} {currentStudent.gender} {currentStudent.fathername}</span> Roll no. <span style={{fontWeight:"bold"}}>{currentStudent.rollno}</span>, Mobile number <span style={{fontWeight:"bold"}}>{currentStudent.phone}</span> has joined us for 6 months training starting from <span style={{fontWeight:"bold"}}>{currentStudent.startingdate} </span>first week in <span style={{fontWeight:"bold"}}>{currentStudent.course}</span> in offline mode. 
                </p>
                <p className="body-text">
                We are enough confident and assure you that your student will nurture good job skills and develop better understanding of the corporate environment under the kind guidance of our well-versed professionals in their respective fields. We shall put our best efforts to make your student good professional so that he/she may be able to win over the cut throat competition in today’s IT industry.
                </p>

                <p className="closing">Thanking you and assuring you of our best services.</p>
                <p>Warm Regards,</p>
                <img src="/sign.jpeg" alt="" style={{ height: '70px' }} />
                <p>Team Hoping Minds</p>
                <p className="contact">+91-7657822600</p>
              </div>

              {/* Footer */}
              <div className="footer">
                <img src="/footer.png" alt="Katina Skills Logo" className="footer-logo" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmationLetter;
