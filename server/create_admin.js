import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow', {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB');

        const email = 'admin@changeflow.com';
        const password = 'admin123';
        const role = 'Admin';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`ℹ️ User ${email} already exists. Updating role to Admin and ensuring active status.`);
            existingUser.role = role;
            existingUser.isActive = true;
            existingUser.password = password; // Will be hashed by pre-save hook
            await existingUser.save();
            console.log('✅ User updated successfully.');
        } else {
            console.log(`👤 Creating new Admin user: ${email}`);
            await User.create({
                name: 'System Administrator',
                email,
                password,
                role,
                isActive: true
            });
            console.log('✅ Admin user created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('connect ECONNREFUSED')) {
            console.error('🚨 MONGODB IS NOT RUNNING. Please start mongod first!');
        }
        process.exit(1);
    }
};

createAdmin();
