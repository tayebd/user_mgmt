import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const search = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }


    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      users
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
};
