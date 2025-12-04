import chatController from '../controllers/chatController.js'
import express from 'express'
import protectedRoute from '../middlewares/authMiddleware.js'
const router = express.Router()

router.get('/chats', chatController.createChat) // ONLY logged-in users can access


export default router
