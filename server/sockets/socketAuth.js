import jwt from 'jsonwebtoken'
import loginHappend from '../controllers/userController.js'

export const socketAuth = (socket, next) => {

  if (loginHappend === 'success') {
    try {
      // console.log('Raw cookies:', socket.request.headers.cookie); // Debug

      const cookies = socket.request.headers.cookie;

      // Fix: Handle BOTH 'token=' and 'accessToken=' formats
      let token = cookies
        ?.split('; ')
        ?.find(row => row.startsWith('token='))
        ?.split('=')[1];

      // Handle URL-encoded cookies (common issue)
      if (token) {
        token = decodeURIComponent(token);
      }

      // console.log('Extracted token:', token ? 'Found' : 'Missing'); // Debug

      if (!token) {
        console.log('No valid token found');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      // console.log(`✅ User ${socket.userId} authenticated via socket`)

      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }

  }
}
