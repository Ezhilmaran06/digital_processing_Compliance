import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
    {
        senderRole: {
            type: String,
            required: true,
            // NO ENUM HERE
        },
        receiverRole: {
            type: String,
            required: true,
            // NO ENUM HERE
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

// Clear any existing models to be safe
if (mongoose.models.Message) delete mongoose.models.Message;
if (mongoose.models.ChatMessage) delete mongoose.models.ChatMessage;

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
