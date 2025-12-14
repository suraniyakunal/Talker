import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import { loginHappend } from '../controllers/userController.js'

const protectedRoute = async (req, res, next) => {
  if (loginHappend === 'success') {
    try {
      const token = req.cookies.token

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' })
      }

      // jwt.verify throws on invalid/expired tokens - no need for !decoded check
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      req.user = user
      return next()
    } catch (error) {
      console.error('Error in protectedRoute middleware:', error.message)

      // Distinguish between JWT errors (401) and other errors (500)
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' })
      }

      return res.status(500).json({ message: 'Internal server error' })
    }
  }

};

export default protectedRoute

