import express from 'express'
import userController from '../controllers/userController.js'
const router = express.Router()


router.post('/login', userController.login)
router.post('/signup', userController.signUp)
router.get('/getUsers', userController.getAllUsers)


export default router
