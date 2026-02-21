import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Request from './models/Request.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        console.log('⏳ Connecting...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        const admin = await User.findOne({ role: 'Admin' });
        if (!admin) {
            console.error('No Admin user found to perform approval');
            process.exit(1);
        }

        const result = await Request.updateMany(
            { status: { $ne: 'Approved' } },
            {
                $set: {
                    status: 'Approved',
                    approvedBy: admin._id,
                    approvalDate: new Date()
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} requests to Approved`);
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

run();
