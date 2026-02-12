import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                'ACCOUNT_CREATED',
                'LOGIN_SUCCESS',
                'LOGIN_FAILED',
                'LOGOUT',
                'REQUEST_CREATED',
                'REQUEST_UPDATED',
                'REQUEST_APPROVED',
                'REQUEST_REJECTED',
                'REQUEST_DELETED',
                'USER_CREATED',
                'USER_UPDATED',
                'USER_DELETED',
                'USER_DEACTIVATED',
                'USER_ACTIVATED',
                'ADMIN_ACTION',
                'PASSWORD_CHANGED',
                'PROFILE_UPDATED',
            ],
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            immutable: true, // Prevent modification
        },
    },
    {
        timestamps: false, // We use custom timestamp field
    }
);

// Prevent updates and deletes on audit logs (immutability)
auditLogSchema.pre('updateOne', function () {
    throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('findOneAndDelete', function () {
    throw new Error('Audit logs cannot be deleted');
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ requestId: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
