import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { app } from '../config/firebase';

const auth = getAuth(app);

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await auth.listUsers();
    res.status(200).json(users.users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await auth.getUser(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  try {
    const user = await auth.createUser({
      email,
      password,
      displayName,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { email, displayName } = req.body;
  try {
    const user = await auth.updateUser(userId, {
      email,
      displayName,
    });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await auth.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
