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
            {
                name: 'Financial Auditor',
                email: 'auditor@changeflow.com',
                password: 'auditor123',
                role: 'Auditor',
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
                environment: 'Production',
                plannedStartDate: new Date('2024-02-15T22:00:00'),
                plannedEndDate: new Date('2024-02-16T02:00:00'),
                implementationPlan: 'Step-by-step migration: 1) Create backup of current database 2) Set up PostgreSQL 15 instance 3) Run migration scripts 4) Verify data integrity 5) Update connection strings 6) Monitor performance',
                rollbackPlan: 'If issues occur: 1) Restore from backup 2) Revert connection strings 3) Notify stakeholders 4) Schedule post-mortem',
                testingPlan: 'Pre-migration testing in staging environment, post-migration data validation scripts, performance benchmarking',
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
                environment: 'Production',
                plannedStartDate: new Date('2024-02-20T10:00:00'),
                plannedEndDate: new Date('2024-02-20T11:00:00'),
                implementationPlan: 'Generate new SSL certificates, update load balancer configuration, verify HTTPS connections, monitor for issues',
                rollbackPlan: 'Keep old certificates active during transition, revert if validation fails',
                testingPlan: 'Test certificate validation in staging, verify all endpoints respond correctly',
                priority: 'High',
                createdBy: employee2._id,
                status: 'Pending',
            },
            {
                title: 'Update Customer Portal UI Components',
                description: 'Update React component library to latest version with improved accessibility features.',
                changeType: 'Application',
                riskLevel: 'Low',
                environment: 'Staging',
                plannedStartDate: new Date('2024-02-18T14:00:00'),
                plannedEndDate: new Date('2024-02-18T16:00:00'),
                implementationPlan: 'Update package dependencies, run automated tests, perform manual UI testing, deploy to staging',
                rollbackPlan: 'Revert to previous version if breaking changes detected',
                testingPlan: 'Automated Jest tests, Cypress E2E tests, manual accessibility testing',
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
                environment: 'Development',
                plannedStartDate: new Date('2024-02-25T09:00:00'),
                plannedEndDate: new Date('2024-02-25T17:00:00'),
                implementationPlan: 'Create dark theme CSS variables, update component styles, add theme toggle, implement localStorage persistence',
                rollbackPlan: 'Feature flag to disable dark mode if issues arise',
                testingPlan: 'Visual regression testing, cross-browser compatibility testing, user acceptance testing',
                priority: 'Low',
                createdBy: employee2._id,
                status: 'Pending',
            },
            {
                title: 'Security Audit and Vulnerability Fixes',
                description: 'Address security vulnerabilities identified in latest penetration testing report.',
                changeType: 'Security',
                riskLevel: 'Critical',
                environment: 'Production',
                plannedStartDate: new Date('2024-02-12T20:00:00'),
                plannedEndDate: new Date('2024-02-13T00:00:00'),
                implementationPlan: 'Apply security patches, update dependencies with known vulnerabilities, implement additional authentication controls',
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
                environment: 'Production',
                plannedStartDate: new Date('2024-03-01T10:00:00'),
                plannedEndDate: new Date('2024-03-01T15:00:00'),
                implementationPlan: 'Apply OS patches, update firewall rules, verify logging configuration',
                rollbackPlan: 'Snapshot restoration if patching fails',
                testingPlan: 'System health check, monitoring alert verification',
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
        console.log('Auditor:  auditor@changeflow.com / auditor123');
        console.log('─'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedData();
