import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

/**
 * Seed database with sample data for testing
 */
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany();
        await Request.deleteMany();
        await AuditLog.deleteMany();

        // Create users
        console.log('👥 Creating users...');
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@changeflow.com',
                password: 'admin123',
                role: 'Admin',
            },
            {
                name: 'Sarah Mitchell',
                email: 'sarah.mitchell@company.com',
                password: 'manager123',
                role: 'Manager',
            },
            {
                name: 'John Davis',
                email: 'john.davis@company.com',
                password: 'employee123',
                role: 'Employee',
            },
            {
                name: 'Emily Rodriguez',
                email: 'emily.rodriguez@company.com',
                password: 'employee123',
                role: 'Employee',
            },
            {
                name: 'Client Partner',
                email: 'client@partner.com',
                password: 'client123',
                role: 'Client',
            },
        ]);

        console.log(`✅ Created ${users.length} users`);

        // Create sample requests
        console.log('📋 Creating sample requests...');
        const employee1 = users.find(u => u.email === 'john.davis@company.com');
        const employee2 = users.find(u => u.email === 'emily.rodriguez@company.com');
        const manager = users.find(u => u.email === 'sarah.mitchell@company.com');

        const requests = await Request.create([
            {
                title: 'Database Migration to PostgreSQL 15',
                description: 'Migrate production database from PostgreSQL 14 to PostgreSQL 15 to leverage new performance improvements and security features.',
                changeType: 'Database',
                riskLevel: 'High',
                justification: 'Critical database upgrade required for performance and security compliance.',
                impactAssessment: 'Brief downtime of 4 hours during off-peak hours. All services will be temporarily unavailable.',
                affectedDepartments: ['IT', 'Operations', 'Engineering'],
                status: 'Approved',
                priority: 'High',
                createdBy: employee1._id,
                approvedBy: manager._id,
                approvalDate: new Date(),
            },
            {
                title: 'SSL Certificate Renewal for API Gateway',
                description: 'Renew SSL certificates for production API gateway endpoints before expiration.',
                changeType: 'Infrastructure',
                riskLevel: 'Medium',
                justification: 'Renew SSL certificates to ensure continuous service availability and security.',
                impactAssessment: 'No service disruption expected during renewal.',
                affectedDepartments: ['IT Security'],
                priority: 'High',
                createdBy: employee2._id,
                status: 'Pending',
            },
            {
                title: 'Update Customer Portal UI Components',
                description: 'Update React component library to latest version with improved accessibility features.',
                changeType: 'Application',
                riskLevel: 'Low',
                justification: 'Update frontend components to modern standards to improve accessibility and user experience.',
                impactAssessment: 'Standard portal update; no downtime.',
                affectedDepartments: ['Product', 'Engineering'],
                status: 'Approved',
                priority: 'Medium',
                createdBy: employee1._id,
                approvedBy: manager._id,
                approvalDate: new Date(),
            },
            {
                title: 'Implement Dark Mode for Dashboard',
                description: 'Add dark mode theme option to main dashboard application for better user experience.',
                changeType: 'Application',
                riskLevel: 'Low',
                justification: 'Enhance dashboard with dark mode based on high volume of user requests.',
                impactAssessment: 'Additive change; no impact on core functionality.',
                affectedDepartments: ['Customer Support', 'Design'],
                priority: 'Low',
                createdBy: employee2._id,
                status: 'Pending',
            },
            {
                title: 'Security Audit and Vulnerability Fixes',
                description: 'Address security vulnerabilities identified in latest penetration testing report.',
                changeType: 'Security',
                riskLevel: 'Critical',
                justification: 'Critical security patches required to maintain regulatory compliance.',
                impactAssessment: 'System restart may cause 5-minute disruption.',
                affectedDepartments: ['Security', 'IT'],
                priority: 'High',
                createdBy: employee1._id,
                approvedBy: manager._id,
                approvalDate: new Date(),
            },
            {
                title: 'Infrastructure Maintenance - Q1 Audit',
                description: 'Routine infrastructure maintenance and security patching for Q1 compliance audit.',
                changeType: 'Infrastructure',
                riskLevel: 'Medium',
                justification: 'Ongoing compliance maintenance for annual Q1 audit process.',
                impactAssessment: 'Maintenance will be conducted transparently without impact.',
                affectedDepartments: ['Infrastructure', 'Compliance'],
                status: 'Sent to Audit',
                priority: 'Medium',
                createdBy: employee2._id,
            },
        ]);

        console.log(`✅ Created ${requests.length} sample requests`);

        // Create sample audit logs
        console.log('📝 Creating audit logs...');
        const auditLogs = await AuditLog.create([
            {
                userId: users[0]._id,
                action: 'ACCOUNT_CREATED',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            },
            {
                userId: employee1._id,
                action: 'LOGIN_SUCCESS',
                ipAddress: '10.0.0.124',
                userAgent: 'Mozilla/5.0',
            },
            {
                userId: employee1._id,
                action: 'REQUEST_CREATED',
                requestId: requests[0]._id,
                ipAddress: '10.0.0.124',
                userAgent: 'Mozilla/5.0',
            },
            {
                userId: manager._id,
                action: 'REQUEST_APPROVED',
                requestId: requests[0]._id,
                ipAddress: '192.168.1.45',
                userAgent: 'Mozilla/5.0',
            },
        ]);

        console.log(`✅ Created ${auditLogs.length} audit log entries`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📧 Test User Credentials:');
        console.log('─'.repeat(50));
        console.log('Admin:    admin@changeflow.com / admin123');
        console.log('Manager:  sarah.mitchell@company.com / manager123');
        console.log('Employee: john.davis@company.com / employee123');
        console.log('Employee: emily.rodriguez@company.com / employee123');
        console.log('Client:   client@partner.com / client123');
        console.log('─'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedData();
