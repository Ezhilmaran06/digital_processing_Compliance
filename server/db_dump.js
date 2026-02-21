import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Request from './models/Request.js';

dotenv.config();

const run = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('Connected');

        const total = await Request.countDocuments();
        const statuses = await Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const samples = await Request.find({ status: 'Approved' }).limit(3);

        const out = {
            total,
            statusBreakdown: statuses,
            approvedSamples: samples
        };

        const fs = await import('fs');
        fs.writeFileSync('db_dump.json', JSON.stringify(out, null, 2));
        console.log('Dumped to db_dump.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
