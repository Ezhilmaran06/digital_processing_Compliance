import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const diag = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected to DB');
        const requestCount = await Request.countDocuments();
        const approvedCount = await Request.countDocuments({ status: 'Approved' });
        const userCount = await User.countDocuments();
        const clientCount = await User.countDocuments({ role: 'Client' });

        console.log('--- DATABASE DIAGNOSTICS ---');
        console.log(`Total Requests: ${requestCount}`);
        console.log(`Approved Requests: ${approvedCount}`);
        console.log(`Total Users: ${userCount}`);
        console.log(`Client Users: ${clientCount}`);
        console.log('----------------------------');

        process.exit(0);
    } catch (error) {
        console.error('DIAG ERROR:', error.message);
        process.exit(1);
    }
};

diag();
