import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const signToken = (payload: { id: number; email: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
