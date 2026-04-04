import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const testEmail = async () => {
    console.log('--- SMTP Test Script ---');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`From: ${process.env.SMTP_FROM}`);
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self
            subject: 'DPC Tool SMTP Test',
            text: 'If you are reading this, your Google SMTP configuration is working correctly!',
            html: '<b>If you are reading this, your Google SMTP configuration is working correctly!</b>',
        });

        console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ SMTP Error:');
        console.error(error);
        
        if (error.code === 'EAUTH') {
            console.log('\nPossible causes:');
            console.log('1. The App Password is incorrect.');
            console.log('2. 2-Step Verification is not enabled on the Google account.');
            console.log('3. The email address is incorrect.');
        }
    }
};

testEmail();
