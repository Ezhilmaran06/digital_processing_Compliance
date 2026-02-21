import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Request from './models/Request.js';

dotenv.config();

const summarize = async () => {
    try {
        console.log('⏳ Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        const userCount = await User.countDocuments();
        const users = await User.find({}, 'name email role isActive');

        const requestCount = await Request.countDocuments();
        const requestStats = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('\n--- SYSTEM SUMMARY ---');
        console.log(`Total Users: ${userCount}`);
        users.forEach(u => console.log(` - ${u.name} (${u.email}) [${u.role}] Active: ${u.isActive}`));

        console.log(`\nTotal Requests: ${requestCount}`);
        requestStats.forEach(s => console.log(` - ${s._id}: ${s.count}`));

        console.log('\n--- END SUMMARY ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during summary:', err.message);
        process.exit(1);
    }
};

summarize();
