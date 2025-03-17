import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all industries
 */
export const getAllIndustries = async (req: Request, res: Response) => {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(industries);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch industries' });
  }
};

/**
 * Get industry by ID
 */
export const getIndustryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const industry = await prisma.industry.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!industry) {
      return res.status(404).json({ error: 'Industry not found' });
    }
    
    return res.status(200).json(industry);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch industry' });
  }
};
