import mongoose from 'mongoose';
import User from './models/User.js';
import Message from './models/Message.js';

const run = async () => {
    try {
        const uri = 'mongodb://127.0.0.1:27017/changeflow';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected!');

        console.log('--- Message Schema Check ---');
        const senderPath = Message.schema.path('senderRole');
        console.log('senderRole options:', JSON.stringify(senderPath.options, null, 2));

        const receiverPath = Message.schema.path('receiverRole');
        console.log('receiverRole options:', JSON.stringify(receiverPath.options, null, 2));

        console.log('--- User Role Check ---');
        const users = await User.find({ role: { $in: ['Admin', 'Manager'] } });
        users.forEach(u => {
            console.log(`User: ${u.name}, Role: "${u.role}", ID: ${u._id}`);
        });

        console.log('DONE');
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
};

run();
