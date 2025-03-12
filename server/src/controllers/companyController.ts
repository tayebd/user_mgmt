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
  const { name, address, website, iconUrl, descriptions = [], projects = [], certifications = [], partnerships = [], services = [] } = req.body;
  try {
    // First create the company without the project
    const company = await prisma.company.create({
      data: {
        name,
        address,
        website,
        iconUrl,
        descriptions: descriptions.length > 0 ? {
          create: descriptions.map((desc: any) => ({
            language: desc.language,
            text: desc.text,
          })),
        } : undefined,
        certifications: certifications.length > 0 ? {
          create: certifications.map((cert: any) => ({
            name: cert.name,
            issuedBy: cert.issuedBy,
            issuedYear: cert.issuedYear,
          })),
        } : undefined,
        partnerships: partnerships.length > 0 ? {
          create: partnerships.map((partnership: any) => ({
            name: partnership.name,
            type: partnership.type,
          })),
        } : undefined,
        services: services.length > 0 ? {
          create: services.map((service: any) => ({
            type: service.type,
          })),
        } : undefined,
      },
    });

    // Then create the project separately if provided
    if (projects.length > 0) {
      const project = projects[0]; // Since it's a one-to-one relationship, only use the first project
      await prisma.companyProject.create({
        data: {
          name: project.name,
          description: project.description,
          address: project.address,
          latitude: project.latitude,
          longitude: project.longitude,
          capacityKw: project.capacityKw,
          completedAt: project.completedAt,
          companyId: company.id
        }
      });
    }

    // Fetch the company with all relations
    const createdCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        descriptions: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true
      }
    });

    res.status(201).json(createdCompany);
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { name, address, website, iconUrl, descriptions = [], projects = [], certifications = [], partnerships = [], services = [] } = req.body;
  try {
    // First, handle the company update without the projects relationship
    const company = await prisma.company.update({
      where: { id: Number(companyId) },
      data: {
        name,
        address,
        website,
        iconUrl,
        descriptions: descriptions.length > 0 ? {
          deleteMany: {},
          create: descriptions.map((desc: any) => ({
            language: desc.language,
            text: desc.text,
          })),
        } : undefined,
        certifications: certifications.length > 0 ? {
          deleteMany: {},
          create: certifications.map((cert: any) => ({
            name: cert.name,
            issuedBy: cert.issuedBy,
            issuedYear: cert.issuedYear,
          })),
        } : undefined,
        partnerships: partnerships.length > 0 ? {
          deleteMany: {},
          create: partnerships.map((partnership: any) => ({
            name: partnership.name,
            type: partnership.type,
          })),
        } : undefined,
        services: services.length > 0 ? {
          deleteMany: {},
          create: services.map((service: any) => ({
            type: service.type,
          })),
        } : undefined,
      },
      include: {
        projects: true
      }
    });

    // Handle the project separately since it's a one-to-one relationship
    if (projects.length > 0) {
      const project = projects[0];
      if (company.projects && company.projects.length > 0) {
        // Update existing project
        await prisma.companyProject.update({
          where: { id: company.projects[0].id },
          data: {
            name: project.name,
            description: project.description,
            address: project.address,
            latitude: project.latitude,
            longitude: project.longitude,
            capacityKw: project.capacityKw,
            completedAt: project.completedAt,
          }
        });
      } else {
        // Create new project
        await prisma.companyProject.create({
          data: {
            name: project.name,
            description: project.description,
            address: project.address,
            latitude: project.latitude,
            longitude: project.longitude,
            capacityKw: project.capacityKw,
            completedAt: project.completedAt,
            companyId: company.id
          }
        });
      }
    }

    // Fetch the updated company with all relations
    const updatedCompany = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      include: {
        descriptions: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true
      }
    });

    res.status(200).json(updatedCompany);
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
