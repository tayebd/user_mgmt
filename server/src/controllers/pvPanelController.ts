import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getPVPanels = async (req: Request, res: Response) => {
  const { page = 1, limit = 50 } = req.query;
  // Parse page and limit, defaulting to 1 and 50 if invalid
  const pageNumber = Number.isNaN(parseInt(page as string, 10)) ? 1 : parseInt(page as string, 10);
  const limitNumber = Number.isNaN(parseInt(limit as string, 10)) ? 50 : parseInt(limit as string, 10);

  try {
    const pvPanels = await prisma.pVPanel.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        moduleType: true,
        shortSide: true,
        longSide: true,
        weight: true,
        performanceWarranty: true,
        productWarranty: true,
        efficiency: true,
        openCircuitVoltage: true,
        shortCircuitCurrent: true,
        maxPower: true,
        tempCoeffPmax: true,
        tempCoeffIsc: true,
        tempCoeffVoc: true,
        tempCoeffIpmax: true,
        tempCoeffVpmax: true,
      },
    });
    res.status(200).json(pvPanels);
  } catch (error) {
    console.error('Error fetching PV panels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  try {
    const pvPanel = await prisma.pVPanel.findUnique({
      where: { id: Number(pvPanelId) },
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        moduleType: true,
        shortSide: true,
        longSide: true,
        weight: true,
        performanceWarranty: true,
        productWarranty: true,
        efficiency: true,
        openCircuitVoltage: true,
        shortCircuitCurrent: true,
        maxPower: true,
        tempCoeffPmax: true,
        tempCoeffIsc: true,
        tempCoeffVoc: true,
        tempCoeffIpmax: true,
        tempCoeffVpmax: true,
      },
    });
    if (!pvPanel) {
      return res.status(404).json({ message: 'PV panel not found' });
    }
    res.status(200).json(pvPanel);
  } catch (error) {
    console.error('Error fetching PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPVPanel = async (req: Request, res: Response) => {
  try {
    // Extract all possible fields from request body
    const {
      manufacturer,
      modelNumber,
      description,
      moduleType,
      shortSide,
      longSide,
      weight,
      performanceWarranty,
      productWarranty,
      efficiency,
      openCircuitVoltage,
      shortCircuitCurrent,
      maxPower,
      currentAtPmax,
      tempCoeffPmax,
      tempCoeffIsc,
      tempCoeffVoc,
      tempCoeffIpmax,
      tempCoeffVpmax,
    } = req.body;

    // Validate required fields
    if (!manufacturer || !modelNumber) {
      return res.status(400).json({ message: 'Manufacturer and model number are required' });
    }

    // Create PV panel with all available fields
    const pvPanel = await prisma.pVPanel.create({
      data: {
        manufacturer,
        modelNumber,
        description,
        moduleType,
        shortSide,
        longSide,
        weight,
        performanceWarranty,
        productWarranty,
        efficiency,
        openCircuitVoltage,
        shortCircuitCurrent,
        maxPower,
        currentAtPmax,
        tempCoeffPmax,
        tempCoeffIsc,
        tempCoeffVoc,
        tempCoeffIpmax,
        tempCoeffVpmax,
      },
    });
    res.status(201).json(pvPanel);
  } catch (error) {
    console.error('Error creating PV panel:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const updatePVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  try {
    // Extract all possible fields from request body
    const {
      manufacturer,
      modelNumber,
      description,
      moduleType,
      shortSide,
      longSide,
      weight,
      performanceWarranty,
      productWarranty,
      efficiency,
      openCircuitVoltage,
      shortCircuitCurrent,
      maxPower,
      currentAtPmax,
      tempCoeffPmax,
      tempCoeffIsc,
      tempCoeffVoc,
      tempCoeffIpmax,
      tempCoeffVpmax,
    } = req.body;

    // Update PV panel with all available fields
    const pvPanel = await prisma.pVPanel.update({
      where: { id: Number(pvPanelId) },
      data: {
        manufacturer,
        modelNumber,
        description,
        moduleType,
        shortSide,
        longSide,
        weight,
        performanceWarranty,
        productWarranty,
        efficiency,
        openCircuitVoltage,
        shortCircuitCurrent,
        maxPower,
        currentAtPmax,
        tempCoeffPmax,
        tempCoeffIsc,
        tempCoeffVoc,
        tempCoeffIpmax,
        tempCoeffVpmax,
      },
    });
    res.status(200).json(pvPanel);
  } catch (error) {
    console.error('Error updating PV panel:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const deletePVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  try {
    await prisma.pVPanel.delete({
      where: { id: Number(pvPanelId) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
