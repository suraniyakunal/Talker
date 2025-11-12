import User from '../models/userModel.js'
import generateToken from '../auth/generateToken.js'

const authLoginUser = async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (user && await (user.matchPassword({ password }))) {
    res.json({
      _id: user.id,
      username: user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  } else {
    res.status(401).json({ message: "invalid email or password" })
  }
}

export default authLoginUser 
