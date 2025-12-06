import express from 'express'
import userController from '../controllers/userController.js'
import protectedRoute from '../middlewares/authMiddleware.js'
const router = express.Router()


router.post('/login', userController.login)
router.post('/signup', userController.signUp)
router.get('/getUsers', protectedRoute, userController.getAllUsers)
router.post('/logout', protectedRoute, userController.logout)

router.put('/update-profile', protectedRoute, userController.updateProfile)

router.get('/check', protectedRoute, userController.checkAuth)

export default router
