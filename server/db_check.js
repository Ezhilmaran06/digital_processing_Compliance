import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Request from './models/Request.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        const stats = await Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const total = await Request.countDocuments();
        fs.writeFileSync('db_check.log', `Total: ${total}\nStats: ${JSON.stringify(stats, null, 2)}`);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_check.log', `Error: ${err.message}`);
        process.exit(1);
    }
};

check();
