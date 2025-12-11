import jwt from 'jsonwebtoken'

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3h',
  })
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3 * 60 * 60 * 1000,
    partitioned: true,
    path: '/'

  })

  return token

}

export default generateToken
