import express from 'express'
import roomController from '../controllers/roomController.js'
import protectedRoute from '../middlewares/authMiddleware.js'
const router = express.Router()

router.post('/createRoom', protectedRoute, roomController.createRoom)


export default router
