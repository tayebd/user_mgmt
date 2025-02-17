import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getPVPanels = async (req: Request, res: Response) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const pvPanels = await prisma.pVPanel.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        nameplateMaxPower: true,
        nameplateShortCircuitCurrent: true,
        nameplateOpenCircuitVoltage: true,
        tempCoeffPmax: true,
        tempCoeffIsc: true,
        tempCoeffVoc: true,
        shortSide: true,
        longSide: true,
        weight: true,
        performanceWarranty: true,
        productWarranty: true,
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
      where: { id: pvPanelId },
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        nameplateMaxPower: true,
        nameplateShortCircuitCurrent: true,
        nameplateOpenCircuitVoltage: true,
        tempCoeffPmax: true,
        tempCoeffIsc: true,
        tempCoeffVoc: true,
        shortSide: true,
        longSide: true,
        weight: true,
        performanceWarranty: true,
        productWarranty: true,
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
  const { manufacturer, modelNumber, description, nameplateMaxPower, nameplateShortCircuitCurrent, nameplateOpenCircuitVoltage, tempCoeffPmax, tempCoeffIsc, tempCoeffVoc, shortSide, longSide, weight, performanceWarranty, productWarranty } = req.body;
  try {
    const pvPanel = await prisma.pVPanel.create({
      data: {
        manufacturer,
        modelNumber,
        description,
        nameplateMaxPower,
        nameplateShortCircuitCurrent,
        nameplateOpenCircuitVoltage,
        tempCoeffPmax,
        tempCoeffIsc,
        tempCoeffVoc,
        shortSide,
        longSide,
        weight,
        performanceWarranty,
        productWarranty,
      },
    });
    res.status(201).json(pvPanel);
  } catch (error) {
    console.error('Error creating PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  const { manufacturer, modelNumber, description, nameplateMaxPower, nameplateShortCircuitCurrent, nameplateOpenCircuitVoltage, tempCoeffPmax, tempCoeffIsc, tempCoeffVoc, shortSide, longSide, weight, performanceWarranty, productWarranty } = req.body;
  try {
    const pvPanel = await prisma.pVPanel.update({
      where: { id: pvPanelId },
      data: {
        manufacturer,
        modelNumber,
        description,
        nameplateMaxPower,
        nameplateShortCircuitCurrent,
        nameplateOpenCircuitVoltage,
        tempCoeffPmax,
        tempCoeffIsc,
        tempCoeffVoc,
        shortSide,
        longSide,
        weight,
        performanceWarranty,
        productWarranty,
      },
    });
    res.status(200).json(pvPanel);
  } catch (error) {
    console.error('Error updating PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  try {
    await prisma.pVPanel.delete({
      where: { id: pvPanelId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
