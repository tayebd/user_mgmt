import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  const { name, location, website } = req.body;
  try {
    const company = await prisma.company.create({
      data: {
        name,
        location,
        website,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { name, location, website } = req.body;
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        location,
        website,
      },
    });
    res.status(200).json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    await prisma.company.delete({
      where: { id: companyId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
