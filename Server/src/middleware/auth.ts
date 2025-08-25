import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  console.log(req.cookies.token)
  const token = req.cookies.token;
  
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    // Type assertion to add user to req
    (req as Request & { user?: JWTPayload }).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
