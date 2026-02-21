import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');

        const targets = ['Approved', 'Completed', 'Sent to Audit'];
        const requests = await Request.find({ status: { $in: targets } });

        console.log('--- TARGETED DB PROBE ---');
        console.log('Targets:', targets);
        console.log('Found:', requests.length);
        requests.forEach(r => console.log(` - [${r.status}] ${r.title}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
