const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const RequestSchema = new mongoose.Schema({
    title: String,
    description: String,
    changeType: String,
    riskLevel: String,
    environment: String,
    status: String,
    priority: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    approvedBy: mongoose.Schema.Types.ObjectId,
    approvalDate: Date
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Request = mongoose.models.Request || mongoose.model('Request', RequestSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    console.log('--- STARTING CJS SEED ---');
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/changeflow');
        console.log('Connected');

        await User.deleteMany({});
        await Request.deleteMany({});

        const admin = await User.create({ name: 'Admin', email: 'admin@cf.com', role: 'Admin', password: 'password' });
        const client = await User.create({ name: 'Vignesh', email: 'client@partner.com', role: 'Client', password: 'password' });
        const emp = await User.create({ name: 'Emp', email: 'emp@cf.com', role: 'Employee', password: 'password' });
        const mgr = await User.create({ name: 'Mgr', email: 'mgr@cf.com', role: 'Manager', password: 'password' });

        await Request.create({
            title: 'Production DB Patch',
            description: 'Critical security update for production database.',
            changeType: 'Database',
            riskLevel: 'High',
            environment: 'Production',
            status: 'Approved',
            priority: 'High',
            createdBy: emp._id,
            approvedBy: mgr._id,
            approvalDate: new Date()
        });

        console.log('Seed Complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
