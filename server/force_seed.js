import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Request from './models/Request.js';

dotenv.config();

const run = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ Connected');

        // 1. Ensure Admin exists
        let admin = await User.findOne({ role: 'Admin' });
        if (!admin) {
            console.log('👤 Creating Admin user...');
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@changeflow.com',
                password: 'admin123',
                role: 'Admin',
                isActive: true
            });
        }
        console.log(`👤 Admin: ${admin.email} (${admin._id})`);

        // 2. Clear Requests
        console.log('🗑️ Clearing existing requests...');
        await Request.deleteMany();

        // 3. Create Sample Requests
        console.log('📋 Creating 15 sample requests...');
        const types = ['Infrastructure', 'Application', 'Database', 'Network', 'Security'];
        const risks = ['Low', 'Medium', 'High', 'Critical'];
        const statuses = ['Approved', 'Pending', 'Rejected', 'In Progress', 'Completed'];

        const reqData = [];
        for (let i = 1; i <= 15; i++) {
            const status = i <= 6 ? 'Approved' : statuses[Math.floor(Math.random() * statuses.length)];
            reqData.push({
                title: `Change Request #${i}: ${types[i % types.length]} Update`,
                description: `This is a detailed description for change request #${i}.`,
                changeType: types[i % types.length],
                riskLevel: risks[i % risks.length],
                environment: 'Production',
                plannedStartDate: new Date(),
                plannedEndDate: new Date(Date.now() + 86400000),
                implementationPlan: 'Step 1, Step 2, Step 3',
                rollbackPlan: 'Revert steps',
                testingPlan: 'Run test suite',
                status: status,
                priority: status === 'Approved' ? 'High' : 'Medium',
                createdBy: admin._id,
                approvedBy: status === 'Approved' ? admin._id : null,
                approvalDate: status === 'Approved' ? new Date() : null
            });
        }

        const created = await Request.insertMany(reqData);
        console.log(`✅ Created ${created.length} requests (${created.filter(r => r.status === 'Approved').length} Approved)`);

        const stats = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('📊 Current Distribution:', JSON.stringify(stats));

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
};

run();
