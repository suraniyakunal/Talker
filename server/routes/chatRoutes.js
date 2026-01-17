import chatController from '../controllers/chatController.js';
import express from 'express';
import protectedRoute from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/createConversations', protectedRoute, chatController.createConversation);
router.get('/getConversations', protectedRoute, chatController.getConversations);
router.post('/createMessages', protectedRoute, chatController.createMessages);
router.get('/getAllMessages/:conversationId', protectedRoute, chatController.getAllMessages);

export default router;
