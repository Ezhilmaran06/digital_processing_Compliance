import express from 'express';
import {
    sendMessage,
    getMessages,
    getUnreadCount,
    markAsRead,
    getMessageRecipients
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All message routes require authentication
router.use(protect);

router.route('/')
    .get(getMessages)
    .post(sendMessage);

router.get('/users', getMessageRecipients);
router.get('/unread', getUnreadCount);

router.patch('/:id/read', markAsRead);

export default router;
