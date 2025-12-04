import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getOrganizations = async (req: Request, res: Response) => {
  console.log('Fetching organizations...');
  try {
    const organizations = await prisma.organization.findMany({
      // select: {
      //   id: true,
      //   name: true,
      //   address: true,
      //   phone: true
      // }
    });
    console.log(`Found ${organizations.length} organizations`);
    res.status(200).json(organizations);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations', details: error?.message || 'Unknown error' });
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: Number(organizationId) },
      include: {
        descriptions: true,
        reviews: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true,
      },
    });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(200).json(organization);
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrganization = async (req: Request, res: Response) => {
  const { name, address, website, iconUrl, descriptions = [], projects = [], certifications = [], partnerships = [], services = [] } = req.body;
  try {
    // First create the organization without the project
    const organization = await prisma.organization.create({
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
      await prisma.organizationProject.create({
        data: {
          name: project.name,
          description: project.description,
          address: project.address,
          latitude: project.latitude,
          longitude: project.longitude,
          capacityKw: project.capacityKw,
          completedAt: project.completedAt,
          organizationId: organization.id
        }
      });
    }

    // Fetch the organization with all relations
    const createdOrganization = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: {
        descriptions: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true
      }
    });

    res.status(201).json(createdOrganization);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const { name, address, website, iconUrl, descriptions = [], projects = [], certifications = [], partnerships = [], services = [] } = req.body;
  try {
    // First, handle the organization update without the projects relationship
    const organization = await prisma.organization.update({
      where: { id: Number(organizationId) },
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
      if (organization.projects && organization.projects.length > 0) {
        // Update existing project
        await prisma.organizationProject.update({
          where: { id: organization.projects[0].id },
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
        await prisma.organizationProject.create({
          data: {
            name: project.name,
            description: project.description,
            address: project.address,
            latitude: project.latitude,
            longitude: project.longitude,
            capacityKw: project.capacityKw,
            completedAt: project.completedAt,
            organizationId: organization.id
          }
        });
      }
    }

    // Fetch the updated organization with all relations
    const updatedOrganization = await prisma.organization.findUnique({
      where: { id: Number(organizationId) },
      include: {
        descriptions: true,
        projects: true,
        certifications: true,
        partnerships: true,
        services: true
      }
    });

    res.status(200).json(updatedOrganization);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    await prisma.organization.delete({
      where: { id: Number(organizationId) },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const { userId, rating, comment } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        userId: Number(userId),
        organizationId: Number(organizationId),
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
  const { organizationId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { organizationId: Number(organizationId) },
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
