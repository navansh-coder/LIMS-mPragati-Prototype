const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF report based on report data
 * @param {Object} report - The report object from MongoDB
 * @param {Object} sampleRequest - The associated sample request
 * @param {Object} user - The user who owns the report
 * @param {Object} verifier - The user who verified the report
 * @param {Object} approver - The user who approved the report
 */
async function generatePDF(report, sampleRequest, user, verifier, approver) {
  return new Promise((resolve, reject) => {
    try {
      // Create a directory for reports if it doesn't exist
      const reportsDir = path.join(__dirname, '../public/reports/pdf');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Set up the PDF document
      const doc = new PDFDocument({ margin: 50 });
      const filePath = path.join(reportsDir, `${report._id}.pdf`);
      const stream = fs.createWriteStream(filePath);

      // Handle stream events
      stream.on('finish', () => {
        resolve(`/reports/pdf/${report._id}.pdf`);
      });

      doc.pipe(stream);

      // Add LIMS header
      doc.fontSize(24).text('mPragati LIMS', { align: 'center' });
      doc.fontSize(16).text('Laboratory Test Report', { align: 'center' });
      doc.moveDown();

      // Add report metadata
      doc.fontSize(12).text(`Report Number: ${report.reportNumber}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Sample Information
      doc.fontSize(14).text('Sample Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Request ID: ${sampleRequest.requestId}`);
      doc.text(`Sample Type: ${sampleRequest.sampleType}`);
      doc.text(`Number of Samples: ${sampleRequest.numberOfSamples}`);
      if (sampleRequest.sampleDescription) {
        doc.text(`Description: ${sampleRequest.sampleDescription}`);
      }
      doc.moveDown();

      // Organization Information
      doc.fontSize(14).text('Organization Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Organization Name: ${user.orgName}`);
      doc.text(`Contact Person: ${user.userName}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Contact Number: ${user.contactNumber || 'N/A'}`);
      doc.moveDown();

      // Test Results
      doc.fontSize(14).text('Test Results', { underline: true });
      doc.moveDown();

      // Create a table for test results
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [200, 150, 100];
      
      // Table Headers
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Parameter', tableLeft, tableTop);
      doc.text('Value', tableLeft + colWidths[0], tableTop);
      doc.text('Unit', tableLeft + colWidths[0] + colWidths[1], tableTop);
      
      doc.moveTo(tableLeft, tableTop - 5)
        .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop - 5)
        .stroke();
      
      doc.moveTo(tableLeft, tableTop + 15)
        .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop + 15)
        .stroke();

      // Table Rows
      doc.font('Helvetica');
      let rowTop = tableTop + 20;
      
      report.testResults.forEach(result => {
        doc.text(result.parameter, tableLeft, rowTop);
        doc.text(result.value, tableLeft + colWidths[0], rowTop);
        doc.text(result.unit, tableLeft + colWidths[0] + colWidths[1], rowTop);
        rowTop += 20;
      });

      // Bottom border for the table
      doc.moveTo(tableLeft, rowTop)
        .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop)
        .stroke();
      
      doc.moveDown(2);

      // Verification and Approval Information
      doc.fontSize(14).text('Verification & Approval', { underline: true });
      doc.fontSize(10);
      
      if (verifier) {
        doc.text(`Verified By: ${verifier.userName}`);
        doc.text(`Verification Date: ${new Date(report.verificationDetails.verifiedAt).toLocaleDateString()}`);
        if (report.verificationDetails.verificationNotes) {
          doc.text(`Verification Notes: ${report.verificationDetails.verificationNotes}`);
        }
      }
      
      doc.moveDown();
      
      if (approver) {
        doc.text(`Approved By: ${approver.userName}`);
        doc.text(`Approval Date: ${new Date(report.approvalDetails.approvedAt).toLocaleDateString()}`);
        if (report.approvalDetails.approvalNotes) {
          doc.text(`Approval Notes: ${report.approvalDetails.approvalNotes}`);
        }
      }
      
      doc.moveDown(2);
      
      // Footer
      doc.fontSize(8).text('This is an electronically generated report.', { align: 'center' });
      doc.text(`mPragati LIMS - Report generated on ${new Date().toLocaleString()}`, { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
}

module.exports = { generatePDF };

