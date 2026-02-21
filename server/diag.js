import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';

dotenv.config();

const diag = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        // Set a short timeout
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow', {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB');

        const totalRequests = await Request.countDocuments();
        const approvedRequests = await Request.countDocuments({ status: 'Approved' });

        console.log('Total Requests:', totalRequests);
        console.log('Approved Requests:', approvedRequests);

        process.exit(0);
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        process.exit(1);
    }
};

diag();
