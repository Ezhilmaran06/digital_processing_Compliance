import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({ avatar: { $ne: '' } });
        console.log(`Found ${users.length} users with avatars:`);
        users.forEach(u => {
            console.log(`- User: ${u.email}, Avatar: "${u.avatar}"`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
