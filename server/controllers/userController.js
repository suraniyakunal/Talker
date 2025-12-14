import User from '../models/userModel.js'
import generateToken from '../auth/generateToken.js'
import bcrypt from 'bcryptjs'


const logout = async (req, res) => {
  const { request } = req.body
  console.log(request)
  if (request === 'yes') {
    try {
      res.cookie('token', '', { maxAge: 0 })
      res.status(200).json({ message: 'Logged out Successfully' })
    } catch (error) {
      console.log("Error in the lougout Controller", error.message)
    }
  }
}

let loginHappend
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'invalid username or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'invalid username or password' });
  }

  if (user && isMatch) {
    generateToken(user._id, res); // sets httpOnly cookie

    loginHappend = 'success'
    return res.status(200).json({
      _id: user._id,
      user: user.username,
      email: user.email,
      profile_Pic: user.profile_Pic,
      role: user.role,
    });

  }
};

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

    const savedUser = new User({
      username,
      email,
      password: hashedPassword,  // Store hashed password correctly
    })

    await savedUser.save()

    if (savedUser) {
      generateToken(savedUser._id, res)
      await savedUser.save()
      res.status(201).json({
        _id: savedUser._id,
        userName: savedUser.username,
        email: savedUser.email,
        profile_Pic: savedUser.profile_Pic,
        role: savedUser.role
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    console.error('Error in signup:', error)
  }
}

const getAllUsers = async (req, res) => {

  try {
    const allUsers = await User.find({}, '-password')
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: 'No users' })
    }
    return res.status(200).json(allUsers)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateProfile = async (req, res) => {

}



const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No valid session' })
    }

    // Optionally refresh user data from DB
    const user = await User.findById(req.user._id).select('-password')

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Error in checkAuth:', error.message)
    return res.status(500).json({ message: 'Server error' })
  }
}

export default { loginHappend, login, signUp, getAllUsers, logout, updateProfile, checkAuth }
