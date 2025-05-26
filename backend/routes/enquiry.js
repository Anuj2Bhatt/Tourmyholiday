const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

// Test route to check if the API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Enquiry API is working' });
});

router.post('/', async (req, res) => {
  console.log('Received enquiry request:', req.body);
  console.log('Environment variables:', {
    EMAIL_USER: process.env.EMAIL_USER,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is not set'
  });

  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
    console.error('Missing environment variables');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. Please contact administrator.'
    });
  }

  const {
    packageName,
    email,
    phone,
    date,
    message,
    persons,
    packageType,
    name
  } = req.body;

  // Validate required fields
  if (!email || !phone || !name) {
    console.log('Missing required fields:', { email, phone, name });
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide all required fields' 
    });
  }

  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Enquiry for ${packageName || 'Tour Package'}`,
    html: `
      <h2>New Package Enquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Package Name:</strong> ${packageName || 'Not specified'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Date:</strong> ${date || 'Not specified'}</p>
      <p><strong>Number of Persons:</strong> ${persons || 'Not specified'}</p>
      <p><strong>Package Type:</strong> ${packageType || 'Not specified'}</p>
      <p><strong>Message:</strong><br/>${message || 'No message provided'}</p>
    `
  };

  try {
    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.json({ success: true, message: 'Enquiry sent successfully!' });
  } catch (err) {
    console.error('Detailed error sending enquiry:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send enquiry. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 