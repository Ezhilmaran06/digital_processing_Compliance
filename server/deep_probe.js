import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Request from './models/Request.js';

dotenv.config();

const probe = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        const allUsers = await User.find({}, 'name email role');
        console.log('--- USERS ---');
        allUsers.forEach(u => console.log(`- ${u._id}: ${u.name} (${u.email}) [${u.role}]`));

        const cheran = await User.findOne({ email: /cheran/i });
        if (cheran) {
            console.log('\n--- CHERAN DETAIL ---');
            console.log(`ID: ${cheran._id}`);
            console.log(`Role: ${cheran.role}`);

            const reqs = await Request.find({});
            console.log(`\n--- ALL REQUESTS (${reqs.length}) ---`);
            reqs.forEach(r => {
                console.log(`- [${r.status}] ${r.title} | Creator: ${r.createdBy} | Approver: ${r.approvedBy}`);
            });
        } else {
            console.log('\n❌ Cheran not found in DB');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

probe();
