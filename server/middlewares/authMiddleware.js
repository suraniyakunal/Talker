import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Access the cookie using cookie-parser

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' })
    }
    req.user = decoded; // Add user payload to request object
    next()
  })
}

app.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}! This is a protected route.` });
})
app.get('/chat', verifyToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}! This is a protected route.` });
})
app.get('/post', verifyToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}! This is a protected route.` });
})
app.get('/room', verifyToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}! This is a protected route.` });
})
