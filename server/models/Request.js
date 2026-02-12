import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a request title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        justification: {
            type: String,
            maxlength: [2000, 'Justification cannot exceed 2000 characters'],
        },
        changeType: {
            type: String,
            required: [true, 'Please specify change type'],
            enum: {
                values: ['Infrastructure', 'Application', 'Database', 'Network', 'Security', 'Other'],
                message: '{VALUE} is not a valid change type',
            },
        },
        riskLevel: {
            type: String,
            required: [true, 'Please specify risk level'],
            enum: {
                values: ['Low', 'Medium', 'High', 'Critical'],
                message: '{VALUE} is not a valid risk level',
            },
        },
        environment: {
            type: String,
            required: [true, 'Please specify environment'],
            enum: {
                values: ['Development', 'Staging', 'Production', 'All'],
                message: '{VALUE} is not a valid environment',
            },
        },
        plannedStartDate: {
            type: Date,
            required: [true, 'Please provide planned start date'],
        },
        plannedEndDate: {
            type: Date,
            required: [true, 'Please provide planned end date'],
        },
        implementationPlan: {
            type: String,
            required: [true, 'Please provide implementation plan'],
            maxlength: [5000, 'Implementation plan cannot exceed 5000 characters'],
        },
        rollbackPlan: {
            type: String,
            required: [true, 'Please provide rollback plan'],
            maxlength: [5000, 'Rollback plan cannot exceed 5000 characters'],
        },
        testingPlan: {
            type: String,
            required: [true, 'Please provide testing plan'],
            maxlength: [5000, 'Testing plan cannot exceed 5000 characters'],
        },
        impactAssessment: {
            type: String,
            maxlength: [2000, 'Impact assessment cannot exceed 2000 characters'],
        },
        affectedDepartments: [{
            type: String,
            trim: true,
        }],
        attachments: [{
            filename: String,
            originalName: String,
            path: String,
            size: Number,
            mimetype: String,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled', 'Sent to Audit'],
            default: 'Pending',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        approvalDate: {
            type: Date,
        },
        rejectionReason: {
            type: String,
            maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
requestSchema.index({ createdBy: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ changeType: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;
