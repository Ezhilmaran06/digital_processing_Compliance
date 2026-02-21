import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkStatus = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow', {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB');

        const admin = await User.findOne({ role: 'Admin' });
        if (admin) {
            console.log('✅ Admin user found:', admin.email);
        } else {
            console.log('❌ No Admin user found in the database.');
        }

        const allUsers = await User.find({}, 'email role');
        console.log('All Users in DB:', JSON.stringify(allUsers, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkStatus();
