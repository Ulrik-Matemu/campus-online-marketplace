import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token using your secret from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Attach the student's ID to the request so the next function knows who is posting
      (req as any).user = decoded;
      
      next(); // Move to the next function (e.g., creating a product)
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};