import User from '../models/userModel.js'
import generateToken from '../auth/generateToken.js'
import bcrypt from 'bcryptjs'


const login = async (req, res) => {
  const { username } = req.body
  const user = await User.findOne({ username })

  if (user) {

    if (isMatch) {
      res.status(201).json({
        username: user.name, // Make sure you intend to use user.name here, not user.username
        email: user.email,
        token: generateToken(user._id) // Ensure generateToken is defined
      });
    }

  } else {
    res.status(401).json({ message: "invalid email or password" })
  }
}


const signUp = async (req, res) => {
  const saltRounds = 10
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const userExists = await User.findOne({ username })
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const savedUser = await User.create({
      username,
      email,
      password: hashedPassword,  // Store hashed password correctly
    })

    res.status(201).json({ message: 'User created successfully', userId: savedUser._id })
  } catch (error) {
    console.error('Error in signup:', error)
    res.status(500).json({ message: 'Server error during signup' })
  }
}


export default { login, signUp }
