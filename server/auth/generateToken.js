import jwt from 'jsonwebtoken';

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? 'none' : 'strict', // 'none' for cross-domain in production
    maxAge: 3 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
