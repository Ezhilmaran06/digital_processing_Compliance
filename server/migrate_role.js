import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('Connected.');

        console.log('Migrating users: "Client" -> "Auditor"...');
        const result = await User.updateMany(
            { role: 'Client' },
            { $set: { role: 'Auditor' } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} users.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
};

migrate();
