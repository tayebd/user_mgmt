import { Request, Response } from 'express';
import { createClient } from '../config/supabase';
import { prisma } from '../config/db';
import { UserRole } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
  const supabase = createClient({ req, res });
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const supabase = createClient({ req, res });
  const { userId } = req.params;
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by Supbase ebase UID and return database user record
// If the user doesn't exist in the database but exists in Supbase, create it
export const getUserByUid = async (req: Request, res: Response) => {
  console.log('==== getUserByUid endpoint called ====');
  console.log('Request params:', req.params);
  console.log('Request headers:', req.headers);
  
  const { uid } = req.params;
  console.log(`Looking up user with UID: ${uid}`);
  
  try {
    // Then find the corresponding database user record
    console.log(`Querying database for user with UID: ${uid}`);
    const dbUser = await prisma.user.findFirst({
      where: { uid },
    });
    console.log(`Database query result:`, dbUser);
    console.log(`Fetched user ${dbUser?.id} by UID: ${uid}`);

    
    if (!dbUser) {
      console.log(`No user found with UID: ${uid}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Successfully returning user data for UID: ${uid}`);
    return res.status(200).json(dbUser);
  } catch (error) {
    console.error('Error fetching/creating user by UID:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const supabase = createClient({ req, res });
  const { email, password, displayName } = req.body;
  try {
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { displayName },
    });
    if (error) throw error;
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const supabase = createClient({ req, res });
  const { userId } = req.params;
  const { email, displayName } = req.body;
  try {
    const { data: user, error } = await supabase.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { displayName },
    });
    if (error) throw error;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const supabase = createClient({ req, res });
  const { userId } = req.params;
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a database user record (for development/mock users)
export const createDatabaseUser = async (req: Request, res: Response) => {
  const { email, name, uid, role, photoURL } = req.body;

  console.log(`[API] Creating user with UID: ${uid}`);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { uid },
    });

    if (existingUser) {
      console.log(`[API] User with UID ${uid} already exists`);
      return res.status(200).json(existingUser);
    }

    // For development, allow creating users without Supabase validation
    // This handles mock users from the frontend
    const newUser = await prisma.user.create({
      data: {
        uid,
        email: email || '',
        name: name || email?.split('@')[0] || 'Anonymous',
        role: (role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER),
        profilePictureUrl: photoURL || null,
      },
    });

    console.log(`[API] Successfully created user with ID: ${newUser.id}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('[API] Error creating database user:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      // Try to find existing user and return it
      try {
        const existingUser = await prisma.user.findFirst({
          where: { uid },
        });
        if (existingUser) {
          console.log(`[API] Found existing user after constraint error: ${existingUser.id}`);
          return res.status(200).json(existingUser);
        }
      } catch (findError) {
        console.error('[API] Error finding existing user:', findError);
      }
    }

    res.status(500).json({
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
