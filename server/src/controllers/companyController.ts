import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        descriptions: true,
        reviews: true,
      },
    });
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
      include: {
        descriptions: true,
        reviews: true,
      },
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
  const { name, location, website, iconUrl, descriptions } = req.body;
  try {
    const company = await prisma.company.create({
      data: {
        name,
        location,
        website,
        iconUrl,
        descriptions: {
          create: descriptions.map((desc: any) => ({
            language: desc.language,
            text: desc.text,
          })),
        },
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
  const { name, location, website, iconUrl, descriptions } = req.body;
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        location,
        website,
        iconUrl,
        descriptions: {
          deleteMany: {},
          create: descriptions.map((desc: any) => ({
            language: desc.language,
            text: desc.text,
          })),
        },
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

export const createReview = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { userId, rating, comment } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        userId,
        companyId,
        rating,
        comment,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { companyId },
      include: {
        user: true,
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment,
      },
    });
    res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
