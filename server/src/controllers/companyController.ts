import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getCompanies = async (req: Request, res: Response) => {
  console.log('Fetching companies...');
  try {
    const companies = await prisma.company.findMany({
      // select: {
      //   id: true,
      //   name: true,
      //   address: true,
      //   phone: true
      // }
    });
    console.log(`Found ${companies.length} companies`);
    res.status(200).json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies', details: error?.message || 'Unknown error' });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      include: {
        descriptions: true,
        reviews: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true,
      },
    });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  const { name, location, website, iconUrl, descriptions, projects, certifications, partnerships, services } = req.body;
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
        projects: {
          create: projects.map((project: any) => ({
            name: project.name,
            description: project.description,
            location: project.location,
            latitude: project.latitude,
            longitude: project.longitude,
            capacityKw: project.capacityKw,
            completedAt: project.completedAt,
          })),
        },
        certifications: {
          create: certifications.map((cert: any) => ({
            name: cert.name,
            issuedBy: cert.issuedBy,
            issuedYear: cert.issuedYear,
          })),
        },
        partnerships: {
          create: partnerships.map((partnership: any) => ({
            name: partnership.name,
            type: partnership.type,
          })),
        },
        services: {
          create: services.map((service: any) => ({
            type: service.type,
          })),
        },
      },
    });
    res.status(201).json(company);
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { name, location, website, iconUrl, descriptions, projects, certifications, partnerships, services } = req.body;
  try {
    const company = await prisma.company.update({
      where: { id: Number(companyId) },
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
        projects: {
          create: projects.map((project: any) => ({
            name: project.name,
            description: project.description,
            location: project.location,
            latitude: project.latitude,
            longitude: project.longitude,
            capacityKw: project.capacityKw,
            completedAt: project.completedAt,
          })),
        },
        certifications: {
          deleteMany: {},
          create: certifications.map((cert: any) => ({
            name: cert.name,
            issuedBy: cert.issuedBy,
            issuedYear: cert.issuedYear,
          })),
        },
        partnerships: {
          deleteMany: {},
          create: partnerships.map((partnership: any) => ({
            name: partnership.name,
            type: partnership.type,
          })),
        },
        services: {
          deleteMany: {},
          create: services.map((service: any) => ({
            type: service.type,
          })),
        },
      },
    });
    res.status(200).json(company);
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    await prisma.company.delete({
      where: { id: Number(companyId) },
    });
    res.status(204).send();
  } catch (error: any) {
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
        userId: Number(userId),
        companyId: Number(companyId),
        rating,
        comment,
      },
    });
    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { companyId: Number(companyId) },
      include: {
        user: true,
      },
    });
    res.status(200).json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  try {
    const review = await prisma.review.update({
      where: { id: Number(reviewId) },
      data: {
        rating,
        comment,
      },
    });
    res.status(200).json(review);
  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  try {
    await prisma.review.delete({
      where: { id: Number(reviewId) },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
