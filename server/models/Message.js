import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderRole: {
            type: String,
            required: true,
            enum: ['Manager', 'Employee', 'Auditor'],
        },
        receiverRole: {
            type: String,
            required: true,
            enum: ['Manager', 'Employee', 'Auditor'],
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster lookups based on receiver and read status
messageSchema.index({ receiverId: 1, read: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
