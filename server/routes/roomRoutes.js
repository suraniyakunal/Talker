import express from 'express'
import roomController from '../controllers/roomController.js'
import protectedRoutes from '../middlewares/authMiddleware.js'
const router = express.Router()

router.post('/createRoom', protectedRoutes, roomController.createRoom)


export default router
