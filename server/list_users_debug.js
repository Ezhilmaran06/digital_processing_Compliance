import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        console.log('⏳ Connecting...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        const users = await User.find({}, 'name email avatar role');
        console.log(`FOUND_USERS:${JSON.stringify(users)}`);

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

run();
