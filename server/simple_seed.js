import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Request from './models/Request.js';

dotenv.config();

const simpleSeed = async () => {
    console.log('🚀 SEED START');
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/changeflow');
        console.log('✅ CONNECTED');

        await User.deleteMany();
        await Request.deleteMany();
        console.log('🗑️ CLEARED');

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@changeflow.com',
            password: 'admin123',
            role: 'Admin'
        });

        const client = await User.create({
            name: 'Client Partner',
            email: 'client@partner.com',
            password: 'client123',
            role: 'Client'
        });

        const employee = await User.create({
            name: 'John Davis',
            email: 'john.davis@company.com',
            password: 'employee123',
            role: 'Employee'
        });

        const manager = await User.create({
            name: 'Sarah Mitchell',
            email: 'sarah.mitchell@company.com',
            password: 'manager123',
            role: 'Manager'
        });

        const request = await Request.create({
            title: 'Database Migration to PostgreSQL 15',
            description: 'Migrate production database from PostgreSQL 14 to PostgreSQL 15.',
            changeType: 'Database',
            riskLevel: 'High',
            justification: 'Modernize database infrastructure for better scalability.',
            impactAssessment: 'Service migration; expected minimal disruption.',
            affectedDepartments: ['Engineering'],
            status: 'Approved',
            priority: 'High',
            createdBy: employee._id,
            approvedBy: manager._id,
            approvalDate: new Date()
        });

        console.log('✨ SEED COMPLETE');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEED ERROR:', error.message);
        process.exit(1);
    }
};

simpleSeed();
