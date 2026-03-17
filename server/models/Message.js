import mongoose from 'mongoose';

console.log('🚀 [MESSAGE MODEL] RELOADING FILE - NO ENUMS MODE');

const messageSchema = new mongoose.Schema(
    {
        sender_role: {
            type: String,
            required: true,
        },
        receiver_role: {
            type: String,
            required: true,
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

// Force clear the model from cache to ensure schema updates take effect
if (mongoose.models.Message) {
    console.log('🔄 Deleting existing Message model from cache...');
    delete mongoose.models.Message;
}

console.log('📦 Initializing Message model with roles: Employee, Manager, Auditor, Admin');
console.log('📦 Initializing ChatMessage model (Fresh Schema)');
const Message = mongoose.model('ChatMessage', messageSchema);

export default Message;
