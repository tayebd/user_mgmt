import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getInverters = async (req: Request, res: Response) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const inverters = await prisma.inverter.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        phaseType: true,
        outputVoltage: true,
        nominalFrequency: true,
        maxOutputCurrent: true,
        nominalOutputPower: true,
        maxOutputPower: true,
        maxApparentPower: true,
        powerFactor: true,
        totalHarmonicDistortion: true,
        acGridConnectionType: true,
        maxDcVoltage: true,
        startVoltage: true,
        nominalDcVoltage: true,
        mpptVoltageRangeMin: true,
        mpptVoltageRangeMax: true,
        numberOfMpptTrackers: true,
        stringsPerMppt: true,
        maxInputCurrentPerMppt: true,
        maxShortCircuitCurrent: true,
        maxRecommendedPvPower: true,
        maxEfficiency: true,
        europeanEfficiency: true,
        mpptEfficiency: true,
        dimensions: true,
        weight: true,
        ipRating: true,
        operatingTempRange: true,
        coolingMethod: true,
        noiseLevel: true,
        communicationInterfaces: true,
        displayType: true,
        protectionFeatures: true,
        certifications: true,
        warrantyYears: true,
      },
    });
    res.status(200).json(inverters);
  } catch (error) {
    console.error('Error fetching inverters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInverter = async (req: Request, res: Response) => {
  const { inverterId } = req.params;
  try {
    const inverter = await prisma.inverter.findUnique({
      where: { id: parseInt(inverterId) },
      select: {
        id: true,
        manufacturer: true,
        modelNumber: true,
        description: true,
        phaseType: true,
        outputVoltage: true,
        nominalFrequency: true,
        maxOutputCurrent: true,
        nominalOutputPower: true,
        maxOutputPower: true,
        maxApparentPower: true,
        powerFactor: true,
        totalHarmonicDistortion: true,
        acGridConnectionType: true,
        maxDcVoltage: true,
        startVoltage: true,
        nominalDcVoltage: true,
        mpptVoltageRangeMin: true,
        mpptVoltageRangeMax: true,
        numberOfMpptTrackers: true,
        stringsPerMppt: true,
        maxInputCurrentPerMppt: true,
        maxShortCircuitCurrent: true,
        maxRecommendedPvPower: true,
        maxEfficiency: true,
        europeanEfficiency: true,
        mpptEfficiency: true,
        dimensions: true,
        weight: true,
        ipRating: true,
        operatingTempRange: true,
        coolingMethod: true,
        noiseLevel: true,
        communicationInterfaces: true,
        displayType: true,
        protectionFeatures: true,
        certifications: true,
        warrantyYears: true,
      },
    });
    if (!inverter) {
      return res.status(404).json({ message: 'Inverter not found' });
    }
    res.status(200).json(inverter);
  } catch (error) {
    console.error('Error fetching inverter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInverter = async (req: Request, res: Response) => {
  const {
    manufacturer,
    modelNumber,
    description,
    phaseType,
    outputVoltage,
    nominalFrequency,
    maxOutputCurrent,
    nominalOutputPower,
    maxOutputPower,
    maxApparentPower,
    powerFactor,
    totalHarmonicDistortion,
    acGridConnectionType,
    maxDcVoltage,
    startVoltage,
    nominalDcVoltage,
    mpptVoltageRangeMin,
    mpptVoltageRangeMax,
    numberOfMpptTrackers,
    stringsPerMppt,
    maxInputCurrentPerMppt,
    maxShortCircuitCurrent,
    maxRecommendedPvPower,
    maxEfficiency,
    europeanEfficiency,
    mpptEfficiency,
    dimensions,
    weight,
    ipRating,
    operatingTempRange,
    coolingMethod,
    noiseLevel,
    communicationInterfaces,
    displayType,
    protectionFeatures,
    certifications,
    warrantyYears,
  } = req.body;
  try {
    const inverter = await prisma.inverter.create({
      data: {
        manufacturer,
        modelNumber,
        description,
        phaseType,
        outputVoltage,
        nominalFrequency,
        maxOutputCurrent,
        nominalOutputPower,
        maxOutputPower,
        maxApparentPower,
        powerFactor,
        totalHarmonicDistortion,
        acGridConnectionType,
        maxDcVoltage,
        startVoltage,
        nominalDcVoltage,
        mpptVoltageRangeMin,
        mpptVoltageRangeMax,
        numberOfMpptTrackers,
        stringsPerMppt,
        maxInputCurrentPerMppt,
        maxShortCircuitCurrent,
        maxRecommendedPvPower,
        maxEfficiency,
        europeanEfficiency,
        mpptEfficiency,
        dimensions,
        weight,
        ipRating,
        operatingTempRange,
        coolingMethod,
        noiseLevel,
        communicationInterfaces,
        displayType,
        protectionFeatures,
        certifications,
        warrantyYears,
      },
    });
    res.status(201).json(inverter);
  } catch (error) {
    console.error('Error creating inverter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInverter = async (req: Request, res: Response) => {
  const { inverterId } = req.params;
  const {
    manufacturer,
    modelNumber,
    description,
    phaseType,
    outputVoltage,
    nominalFrequency,
    maxOutputCurrent,
    nominalOutputPower,
    maxOutputPower,
    maxApparentPower,
    powerFactor,
    totalHarmonicDistortion,
    acGridConnectionType,
    maxDcVoltage,
    startVoltage,
    nominalDcVoltage,
    mpptVoltageRangeMin,
    mpptVoltageRangeMax,
    numberOfMpptTrackers,
    stringsPerMppt,
    maxInputCurrentPerMppt,
    maxShortCircuitCurrent,
    maxRecommendedPvPower,
    maxEfficiency,
    europeanEfficiency,
    mpptEfficiency,
    dimensions,
    weight,
    ipRating,
    operatingTempRange,
    coolingMethod,
    noiseLevel,
    communicationInterfaces,
    displayType,
    protectionFeatures,
    certifications,
    warrantyYears,
  } = req.body;
  try {
    const inverter = await prisma.inverter.update({
      where: { id: parseInt(inverterId) },
      data: {
        manufacturer,
        modelNumber,
        description,
        phaseType,
        outputVoltage,
        nominalFrequency,
        maxOutputCurrent,
        nominalOutputPower,
        maxOutputPower,
        maxApparentPower,
        powerFactor,
        totalHarmonicDistortion,
        acGridConnectionType,
        maxDcVoltage,
        startVoltage,
        nominalDcVoltage,
        mpptVoltageRangeMin,
        mpptVoltageRangeMax,
        numberOfMpptTrackers,
        stringsPerMppt,
        maxInputCurrentPerMppt,
        maxShortCircuitCurrent,
        maxRecommendedPvPower,
        maxEfficiency,
        europeanEfficiency,
        mpptEfficiency,
        dimensions,
        weight,
        ipRating,
        operatingTempRange,
        coolingMethod,
        noiseLevel,
        communicationInterfaces,
        displayType,
        protectionFeatures,
        certifications,
        warrantyYears,
      },
    });
    res.status(200).json(inverter);
  } catch (error) {
    console.error('Error updating inverter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteInverter = async (req: Request, res: Response) => {
  const { inverterId } = req.params;
  try {
    await prisma.inverter.delete({
      where: { id: parseInt(inverterId) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting inverter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
