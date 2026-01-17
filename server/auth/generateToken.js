import jwt from 'jsonwebtoken';

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 3 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
