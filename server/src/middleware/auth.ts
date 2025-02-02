// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { prisma } from '../config/db';
import { UserRole, Prisma } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'No authorization header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid authorization format - expected Bearer token');
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token found, attempting to verify...');
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('Token verified successfully:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
      });

      // First try to find user by Firebase UID
      let user = await prisma.user.findUnique({
        where: { id: decodedToken.uid }
      });

      // If not found by UID, try to find by email
      if (!user && decodedToken.email) {
        user = await prisma.user.findUnique({
          where: { email: decodedToken.email }
        });

        // If found by email but different UID, update the UID
        if (user && user.id !== decodedToken.uid) {
          console.log('Updating user ID to match Firebase UID');
          user = await prisma.user.update({
            where: { id: user.id },
            data: { id: decodedToken.uid }
          });
        }
      }

      // If user doesn't exist at all, create them
      if (!user) {
        console.log('Creating new user in database:', decodedToken.uid);
        try {
          user = await prisma.user.create({
            data: {
              id: decodedToken.uid,
              email: decodedToken.email || '',
              name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Anonymous',
              role: UserRole.USER,
            }
          });
          console.log('User created successfully:', user);
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              console.error('Unique constraint failed, trying to find existing user');
              user = await prisma.user.findUnique({
                where: { email: decodedToken.email || '' }
              });
              if (!user) {
                throw new Error('Failed to create or find user');
              }
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      // Add the user to the request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during token verification';
      res.status(401).json({ message: 'Invalid token', error: errorMessage });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error in auth middleware';
    res.status(500).json({ message: errorMessage });
  }
};
