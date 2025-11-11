import express from 'express'
import userController from '../controllers/loginController.js'
const router = express.Router()


router.get('/api/users/login', userController)
router.post('/')

