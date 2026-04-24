
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nati3112hernandez@gmail.com',
    pass: process.env.EMAIL_PASS || 'eocc sscm kstz fehv'
  }
});

async function test() {
  console.log('Testing connection...');
  try {
    await transporter.verify();
    console.log('✅ Connection successful');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER || 'nati3112hernandez@gmail.com'}>`,
      to: 'nati3112hernandez@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email'
    });
    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
