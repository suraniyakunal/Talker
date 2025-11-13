import express from 'express'
import userController from '../controllers/userController.js'
const router = express.Router()


router.post('/login', userController.login)
router.post('/signup', userController.signUp)


export default router
