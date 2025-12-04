// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { UserRole, Prisma } from '@prisma/client';
import { createClient } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        uid: string;
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

    // Handle mock tokens in development
    if (process.env.NODE_ENV !== 'production' && token === 'mock-access-token') {
      console.log('Using mock authentication for development');
      req.user = {
        id: 15,
        uid: 'mock-user-id',
        email: 'test@example.com',
        role: 'USER'
      };
      return next();
    }

    try {
      const supabase = createClient({ req, res });
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (error || !supabaseUser) {
        throw new Error(error?.message || 'Failed to verify user');
      }
      console.log('Supabase user verified successfully:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
      });

      // First try to find user by Supabase ID
      let user = await prisma.user.findUnique({
        where: { uid: supabaseUser.id }
      });

      // If not found by ID, try to find by email
      if (!user && supabaseUser.email) {
        user = await prisma.user.findUnique({
          where: { email: supabaseUser.email }
        });

        // If found by email but different ID, update the ID
        if (user && user.uid !== supabaseUser.id) {
          console.log('Updating user ID to match Supabase ID');
          user = await prisma.user.update({
            where: { id: user.id },
            data: { uid: supabaseUser.id }
          });
        }
      }

      // If user doesn't exist at all, create them
      if (!user) {
        console.log('Creating new user in database:', supabaseUser.id);
        try {
          user = await prisma.user.create({
            data: {
              uid: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Anonymous',
              role: UserRole.USER,
            }
          });
          console.log('User created successfully:', user);
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              console.error('Unique constraint failed, trying to find existing user');
              user = await prisma.user.findUnique({
                where: { email: supabaseUser.email || '' }
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
        uid: user.uid,
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
