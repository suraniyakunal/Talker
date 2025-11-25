import User from '../models/userModel.js'
import generateToken from '../auth/generateToken.js'
import bcrypt from 'bcryptjs'


const login = async (req, res) => {
  console.log(req.body)
  const { username, password } = req.body
  const user = await User.findOne({ username })

  if (user) {

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      let token = generateToken(user._id) // Ensure generateToken is defined
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 3600000,
      })

      res.status(200).json({ user: { id: user._id, username: user.username } })
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

    res.status(201).json({ message: 'User created successfully', userName: username })
    console.log("user created", username)
  } catch (error) {
    console.error('Error in signup:', error)
    res.status(500).json({ message: 'Server error during signup' })
  }
}


export default { login, signUp }
