import { Request, Response } from 'express';
import { prisma } from '../config/db';

// Enhanced Panel API - Includes AI Intelligence
export const getEnhancedPVPanels = async (req: Request, res: Response) => {
  const { page = 1, limit = 50, includeAI = false } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const includeAIIntelligence = includeAI === 'true';

  try {
    // Get clean panel data from master table
    const panels = await prisma.pVPanel.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        maker: true,
        model: true,
        description: true,
        maxPower: true,
        efficiency: true,
        openCircuitVoltage: true,
        shortCircuitCurrent: true,
        currentAtPmax: true,
        voltageAtPmax: true,
        tempCoeffVoc: true,
        tempCoeffIsc: true,
        weight: true,
        performanceWarranty: true,
        productWarranty: true,

        shortSide: true,
        longSide: true,

      },
    });

    // If AI intelligence requested, join with AI data
    if (includeAIIntelligence) {
      const panelIds = panels.map(p => p.id);
      const aiIntelligence = await prisma.aiPanelIntelligence.findMany({
        where: { panelId: { in: panelIds } },
      });

      // Merge AI intelligence with panel data
      const enhancedPanels = panels.map(panel => ({
        ...panel,
        aiIntelligence: aiIntelligence.find(ai => ai.id === String(panel.id)) || null
      }));

      return res.status(200).json(enhancedPanels);
    }

    res.status(200).json(panels);
  } catch (error) {
    console.error('Error fetching enhanced PV panels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enhanced Single Panel API
export const getEnhancedPVPanel = async (req: Request, res: Response) => {
  const { pvPanelId } = req.params;
  const { includeAI = false } = req.query;

  try {
    // Get clean panel data
    const panel = await prisma.pVPanel.findUnique({
      where: { id: Number(pvPanelId) },
      select: {
        id: true,
        maker: true,
        model: true,
        description: true,
        maxPower: true,
        efficiency: true,
        openCircuitVoltage: true,
        shortCircuitCurrent: true,
        currentAtPmax: true,
        voltageAtPmax: true,
        tempCoeffVoc: true,
        tempCoeffIsc: true,
        weight: true,
        shortSide: true,
        longSide: true,
        performanceWarranty: true,
        productWarranty: true,
      },
    });

    if (!panel) {
      return res.status(404).json({ message: 'PV panel not found' });
    }

    // If AI intelligence requested
    if (includeAI === 'true') {
      const aiIntelligence = await prisma.aiPanelIntelligence.findUnique({
        where: { panelId: Number(pvPanelId) },
      });

      return res.status(200).json({
        ...panel,
        aiIntelligence
      });
    }

    res.status(200).json(panel);
  } catch (error) {
    console.error('Error fetching enhanced PV panel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// AI Intelligence Specific Endpoints
export const getPanelIntelligence = async (req: Request, res: Response) => {
  const { panelId } = req.params;

  try {
    const intelligence = await prisma.aiPanelIntelligence.findUnique({
      where: { panelId: Number(panelId) },
    });

    if (!intelligence) {
      return res.status(404).json({
        message: 'AI intelligence not found for this panel',
        available: false
      });
    }

    res.status(200).json({
      ...intelligence,
      available: true
    });
  } catch (error) {
    console.error('Error fetching panel AI intelligence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enhanced Inverter APIs (similar pattern)
export const getEnhancedInverters = async (req: Request, res: Response) => {
  const { page = 1, limit = 50, includeAI = false } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const includeAIIntelligence = includeAI === 'true';

  try {
    const inverters = await prisma.inverter.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        maker: true,
        model: true,
        description: true,
        phaseType: true,
        maxOutputPower: true,
        nominalOutputPower: true,
        maxEfficiency: true,
        maxDcVoltage: true,
        mpptVoltageRangeMin: true,
        mpptVoltageRangeMax: true,
        numberOfMpptTrackers: true,
        maxInputCurrentPerMppt: true,
        maxShortCircuitCurrent: true,
        outputVoltage: true,
        warrantyYears: true,
      },
    });

    if (includeAIIntelligence) {
      const inverterIds = inverters.map(i => i.id);
      const aiIntelligence = await prisma.aiInverterIntelligence.findMany({
        where: { inverterId: { in: inverterIds } },
      });

      const enhancedInverters = inverters.map(inverter => ({
        ...inverter,
        aiIntelligence: aiIntelligence.find(ai => ai.inverterId === inverter.id) || null
      }));

      return res.status(200).json(enhancedInverters);
    }

    res.status(200).json(inverters);
  } catch (error) {
    console.error('Error fetching enhanced inverters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInverterIntelligence = async (req: Request, res: Response) => {
  const { inverterId } = req.params;

  try {
    const intelligence = await prisma.aiInverterIntelligence.findUnique({
      where: { inverterId: Number(inverterId) },
    });

    if (!intelligence) {
      return res.status(404).json({
        message: 'AI intelligence not found for this inverter',
        available: false
      });
    }

    res.status(200).json({
      ...intelligence,
      available: true
    });
  } catch (error) {
    console.error('Error fetching inverter AI intelligence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Compatibility Analysis
export const getCompatibilityAnalysis = async (req: Request, res: Response) => {
  const { panelId, inverterId } = req.params;

  try {
    // Get clean equipment data
    const [panel, inverter] = await Promise.all([
      prisma.pVPanel.findUnique({
        where: { id: Number(panelId) },
        select: {
          id: true,
          maker: true,
          model: true,
          maxPower: true,
          openCircuitVoltage: true,
          shortCircuitCurrent: true,
          currentAtPmax: true,
          voltageAtPmax: true,
          tempCoeffVoc: true,
          tempCoeffIsc: true,
        }
      }),
      prisma.inverter.findUnique({
        where: { id: Number(inverterId) },
        select: {
          id: true,
          maker: true,
          model: true,
          maxOutputPower: true,
          maxDcVoltage: true,
          maxInputCurrentPerMppt: true,
          mpptVoltageRangeMin: true,
          mpptVoltageRangeMax: true,
          maxShortCircuitCurrent: true,
        }
      })
    ]);

    if (!panel || !inverter) {
      return res.status(404).json({
        message: 'Panel or inverter not found',
        panel: !!panel,
        inverter: !!inverter
      });
    }

    // Get AI compatibility analysis
    const compatibility = await prisma.aiCompatibilityMatrix.findFirst({
      where: {
        panelId: Number(panelId),
        inverterId: Number(inverterId)
      }
    });

    // If no AI analysis exists, return basic compatibility check
    if (!compatibility) {
      const basicCompatibility = performBasicCompatibilityCheck(panel, inverter);
      return res.status(200).json({
        equipment: { panel, inverter },
        compatibility: basicCompatibility,
        aiAnalysis: {
          available: false,
          message: 'AI analysis not yet available for this combination'
        }
      });
    }

    res.status(200).json({
      equipment: { panel, inverter },
      aiAnalysis: {
        available: true,
        ...compatibility
      }
    });
  } catch (error) {
    console.error('Error fetching compatibility analysis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Basic compatibility check for when AI data is not available
function performBasicCompatibilityCheck(panel: any, inverter: any) {
  const issues = [];
  const recommendations = [];

  // Voltage compatibility
  const vocAtMinus10 = panel.openCircuitVoltage * (1 + panel.tempCoeffVoc / 100 * (-35));
  if (vocAtMinus10 > inverter.maxDcVoltage) {
    issues.push(`Panel Voc at -10°C (${vocAtMinus10.toFixed(1)}V) exceeds inverter max voltage (${inverter.maxDcVoltage}V)`);
    recommendations.push('Reduce panels per string or choose different inverter');
  }

  // Current compatibility
  if (panel.shortCircuitCurrent > inverter.maxInputCurrentPerMppt) {
    issues.push(`Panel short-circuit current (${panel.shortCircuitCurrent}A) exceeds inverter MPPT current (${inverter.maxInputCurrentPerMppt}A)`);
    recommendations.push('Check parallel string configuration');
  }

  // Power compatibility
  const typicalArraySize = 20;
  const totalPower = panel.maxPower * typicalArraySize;
  if (totalPower > inverter.maxOutputPower * 1.5) {
    issues.push(`Typical array power (${totalPower}W) may exceed inverter capacity`);
    recommendations.push('Consider larger inverter or fewer panels');
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
    score: Math.max(0, 100 - (issues.length * 25)), // Simple scoring
    needsAIAnalysis: issues.length > 0
  };
}