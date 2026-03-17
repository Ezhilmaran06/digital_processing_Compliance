import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- DATABASE DIAGNOSTIC ---');

        // Check Message Model Enums
        const senderRoleEnum = Message.schema.path('senderRole').options.enum;
        console.log('Message.senderRole enum values:', JSON.stringify(senderRoleEnum));

        const receiverRoleEnum = Message.schema.path('receiverRole').options.enum;
        console.log('Message.receiverRole enum values:', JSON.stringify(receiverRoleEnum));

        // Check Admin Users
        const admins = await User.find({ role: 'Admin' });
        console.log('Found Admin users:', admins.length);
        admins.forEach(a => {
            console.log(`- ${a.name}: role="${a.role}" (length: ${a.role.length})`);
        });

        // Check Manager Users
        const managers = await User.find({ role: 'Manager' });
        console.log('Found Manager users:', managers.length);
        managers.forEach(m => {
            console.log(`- ${m.name}: role="${m.role}" (length: ${m.role.length})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
