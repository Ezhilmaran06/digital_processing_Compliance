import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Request from './models/Request.js';

dotenv.config();

const run = async () => {
    try {
        console.log('⏳ Connecting...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        const stats = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('STATS_REPLY:' + JSON.stringify(stats));

        const types = await Request.aggregate([
            { $group: { _id: '$changeType', count: { $sum: 1 } } }
        ]);
        console.log('TYPES_REPLY:' + JSON.stringify(types));

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

run();
