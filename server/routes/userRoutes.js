import express from 'express'
import userController from '../controllers/userController.js'
const router = express.Router()


router.get('/api/users/login', userController)
router.post('/')


export default router
