import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('Connected to DB');

        // Upsert Eren Yeager (Admin)
        await User.findOneAndUpdate(
            { email: 'eren@changeflow.com' },
            {
                name: 'Eren yeager',
                password: 'password123',
                role: 'Admin',
                isActive: true
            },
            { upsert: true, new: true }
        );

        // Upsert Mikasa (Manager)
        await User.findOneAndUpdate(
            { email: 'mikasa@changeflow.com' },
            {
                name: 'Mikasa Ackerman',
                password: 'password123',
                role: 'Manager',
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('Seed successful: Eren (Admin) and Mikasa (Manager) are ready.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
