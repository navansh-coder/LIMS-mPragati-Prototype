require('dotenv').config();
const sendEmail = require('./config/email');

const testEmail = async () => {
  try {
    await sendEmail({
      email: 'ngoswami_be22@thapar.edu',
      subject: 'Test Email',
      message: 'If you receive this, the email configuration is working!'
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail();