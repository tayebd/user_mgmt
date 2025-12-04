import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { authenticateToken } from '../middleware/auth';

// AI Design Management Controllers

export const createAIDesign = async (req: Request, res: Response) => {
  const { requirements, locationContext } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    // Create AI design record
    const aiDesign = await prisma.aiDesign.create({
      data: {
        userId,
        requirements,
        locationContext,
        status: 'PROCESSING',
        aiModelVersion: '1.0.0',
        designResult: null as any,
        equipmentSelections: null as any,
        systemConfiguration: null as any,
        performanceEstimates: null as any,
        costAnalysis: null as any,
        complianceResults: null as any,
        alternatives: null as any,
        confidenceScore: null,
        processingTimeMs: null,
      },
    });

    // TODO: Queue AI design processing job
    // For now, we'll simulate processing
    setTimeout(async () => {
      await processAIDesign(aiDesign.id);
    }, 1000);

    res.status(201).json({
      id: aiDesign.id,
      status: 'PROCESSING',
      message: 'AI design process initiated',
      estimatedTime: '2-3 minutes'
    });
  } catch (error) {
    console.error('Error creating AI design:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

export const getAIDesigns = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const where = {
      userId,
      ...(status && { status: status as 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' })
    };

    const [designs, total] = await Promise.all([
      prisma.aiDesign.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          confidenceScore: true,
          processingTimeMs: true,
          // Include summary of requirements for list view
          requirements: true
        },
      }),
      prisma.aiDesign.count({ where })
    ]);

    res.status(200).json({
      designs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching AI designs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAIDesign = async (req: Request, res: Response) => {
  const { designId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    const design = await prisma.aiDesign.findFirst({
      where: {
        id: designId,
        userId
      },
      include: {
        analytics: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!design) {
      return res.status(404).json({ message: 'AI design not found' });
    }

    res.status(200).json(design);
  } catch (error) {
    console.error('Error fetching AI design:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAIDesign = async (req: Request, res: Response) => {
  const { designId } = req.params;
  const { designResult, equipmentSelections, systemConfiguration } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    // Verify user owns this design
    const existingDesign = await prisma.aiDesign.findFirst({
      where: { id: designId, userId }
    });

    if (!existingDesign) {
      return res.status(404).json({ message: 'AI design not found' });
    }

    const updatedDesign = await prisma.aiDesign.update({
      where: { id: designId },
      data: {
        designResult,
        equipmentSelections,
        systemConfiguration,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.status(200).json(updatedDesign);
  } catch (error) {
    console.error('Error updating AI design:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAIDesign = async (req: Request, res: Response) => {
  const { designId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    // Verify user owns this design
    const existingDesign = await prisma.aiDesign.findFirst({
      where: { id: designId, userId }
    });

    if (!existingDesign) {
      return res.status(404).json({ message: 'AI design not found' });
    }

    await prisma.aiDesign.delete({
      where: { id: designId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting AI design:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// AI Intelligence Controllers

export const getPanelIntelligence = async (req: Request, res: Response) => {
  const { panelId } = req.params;

  try {
    const intelligence = await prisma.aiPanelIntelligence.findUnique({
      where: { panelId: parseInt(panelId) },
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

export const getInverterIntelligence = async (req: Request, res: Response) => {
  const { inverterId } = req.params;

  try {
    const intelligence = await prisma.aiInverterIntelligence.findUnique({
      where: { inverterId: parseInt(inverterId) },
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

export const getCompatibilityAnalysis = async (req: Request, res: Response) => {
  const { panelId, inverterId } = req.params;

  try {
    // Get AI compatibility analysis
    const compatibility = await prisma.aiCompatibilityMatrix.findFirst({
      where: {
        panelId: parseInt(panelId),
        inverterId: parseInt(inverterId)
      }
    });

    // If no AI analysis exists, return basic compatibility check
    if (!compatibility) {
      const basicCompatibility = await performBasicCompatibilityCheck(
        parseInt(panelId),
        parseInt(inverterId)
      );
      return res.status(200).json({
        panelId: parseInt(panelId),
        inverterId: parseInt(inverterId),
        aiAnalysis: {
          available: false,
          message: 'AI analysis not yet available for this combination'
        },
        basicCompatibility
      });
    }

    res.status(200).json({
      panelId: parseInt(panelId),
      inverterId: parseInt(inverterId),
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

// User AI Preferences Controllers

export const getUserAIPreferences = async (req: Request, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    let preferences = await prisma.userAiPreferences.findUnique({
      where: { userId }
    });

    // If no preferences exist, create default preferences
    if (!preferences) {
      preferences = await prisma.userAiPreferences.create({
        data: {
          userId,
          equipmentPreferences: {},
          budgetPreferences: {},
          brandPreferences: {},
          aestheticPreferences: {},
          performancePriorities: {},
        }
      });
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching user AI preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserAIPreferences = async (req: Request, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;
  const { equipmentPreferences, budgetPreferences, brandPreferences, aestheticPreferences, performancePriorities } = req.body;

  try {
    const updatedPreferences = await prisma.userAiPreferences.upsert({
      where: { userId },
      update: {
        equipmentPreferences,
        budgetPreferences,
        brandPreferences,
        aestheticPreferences,
        performancePriorities,
        updatedAt: new Date()
      },
      create: {
        userId,
        equipmentPreferences,
        budgetPreferences,
        brandPreferences,
        aestheticPreferences,
        performancePriorities,
      }
    });

    res.status(200).json(updatedPreferences);
  } catch (error) {
    console.error('Error updating user AI preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// AI Analytics Controllers

export const createDesignAnalytics = async (req: Request, res: Response) => {
  const { designId } = req.params;
  const {
    userSatisfactionScore,
    feedbackText,
    feedbackCategories,
    userModifications,
    finalDesign
  } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    // Get the original design for comparison
    const originalDesign = await prisma.aiDesign.findUnique({
      where: { id: designId }
    });

    if (!originalDesign) {
      return res.status(404).json({ message: 'AI design not found' });
    }

    const analytics = await prisma.aiDesignAnalytics.create({
      data: {
        designId,
        userId,
        originalRequirements: originalDesign.requirements as any,
        aiRecommendations: originalDesign.designResult as any,
        userModifications: userModifications || null,
        finalDesign: finalDesign || null,
        userSatisfactionScore,
        feedbackText,
        feedbackCategories,
        timeToComplete: Date.now() - originalDesign.createdAt.getTime(),
      }
    });

    res.status(201).json(analytics);
  } catch (error) {
    console.error('Error creating design analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAIAnalytics = async (req: Request, res: Response) => {
  const { timeRange = '30days', metric = 'satisfaction' } = req.query;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    const timeRangeMap = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '1year': 365
    };

    const daysAgo = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const analytics = await prisma.aiDesignAnalytics.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary statistics
    const summary = {
      totalDesigns: analytics.length,
      averageSatisfaction: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.userSatisfactionScore || 0), 0) / analytics.length
        : 0,
      completionRate: analytics.filter(a => a.finalDesign).length / (analytics.length || 1),
      averageTime: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.timeToComplete || 0), 0) / analytics.length
        : 0
    };

    res.status(200).json({
      analytics,
      summary,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper Functions

async function processAIDesign(designId: string) {
  const startTime = Date.now();

  try {
    // Import AI services
    const { AIEquipmentSelector } = await import('../services/AIEquipmentSelector');
    const { AIComplianceChecker } = await import('../services/AIComplianceChecker');
    const { PVLibPerformanceSimulator } = await import('../services/PVLibPerformanceSimulator');

    // Get the design requirements
    const design = await prisma.aiDesign.findUnique({
      where: { id: designId }
    });

    if (!design) {
      throw new Error('Design not found');
    }

    console.log(`🤖 Processing AI design ${designId} with requirements:`, design.requirements);

    // Extract requirements
    const requirements = design.requirements as any;
    const locationContext = design.locationContext as any;

    // Create combined requirements object
    const designRequirements = {
      location: requirements.location || 'Unknown',
      latitude: locationContext?.latitude || 48.8566, // Default to Paris
      longitude: locationContext?.longitude || 2.3522,
      climateZone: locationContext?.climateZone || 'Cfb',
      powerTarget: requirements.powerTarget || 6000, // Watts
      budget: requirements.budget,
      roofType: requirements.roofType || 'tilted',
      orientation: requirements.orientation || 'south',
      tilt: requirements.tilt || 30,
      shading: requirements.constraints || [],
      constraints: requirements.constraints || [],
      priority: requirements.priority || 'efficiency',
      locationContext,
    };

    console.log('🔍 Starting AI equipment selection...');
    const equipmentSelector = new AIEquipmentSelector();
    const equipmentSelection = await equipmentSelector.selectOptimalEquipment(designRequirements);

    console.log('🔍 Starting compliance check...');
    const complianceChecker = new AIComplianceChecker();
    const complianceResults = complianceChecker.checkCompliance(
      equipmentSelection.configuration,
      equipmentSelection.panel,
      equipmentSelection.inverter,
      designRequirements
    );

    console.log('📊 Starting PVLib performance simulation...');
    const performanceSimulator = new PVLibPerformanceSimulator();
    const performanceEstimates = await performanceSimulator.simulatePerformance(
      equipmentSelection.configuration,
      equipmentSelection.panel,
      equipmentSelection.inverter,
      equipmentSelector['calculateLocationFactors'](designRequirements),
      designRequirements
    );

    // Prepare results
    const results = {
      designResult: {
        panels: {
          selected: {
            id: equipmentSelection.panel.id,
            maker: equipmentSelection.panel.maker,
            model: equipmentSelection.panel.model,
            maxPower: equipmentSelection.panel.maxPower,
            efficiency: equipmentSelection.panel.efficiency,
          },
          quantity: equipmentSelection.configuration.totalPanels,
          totalPowerDC: equipmentSelection.configuration.totalPowerDC,
        },
        inverter: {
          selected: {
            id: equipmentSelection.inverter.id,
            maker: equipmentSelection.inverter.maker,
            model: equipmentSelection.inverter.model,
            maxOutputPower: equipmentSelection.inverter.maxOutputPower,
            efficiency: equipmentSelection.inverter.europeanEfficiency,
          },
          quantity: 1,
          totalPowerAC: equipmentSelection.inverter.maxOutputPower,
        },
        configuration: equipmentSelection.configuration,
        cost: {
          total: equipmentSelection.totalCost,
          equipment: equipmentSelection.totalCost * 0.75, // 75% equipment
          installation: equipmentSelection.totalCost * 0.25, // 25% installation
          costPerWatt: equipmentSelection.totalCost / equipmentSelection.configuration.totalPowerDC,
        },
        roi: equipmentSelection.roi,
      },
      equipmentSelections: {
        panelId: equipmentSelection.panel.id,
        inverterId: equipmentSelection.inverter.id,
        mountingSystem: designRequirements.roofType === 'flat' ? 'ballasted' : 'roof-mounted',
        optimization: equipmentSelection.configuration.numberOfStrings > 1 ? 'power_optimizers' : 'string_inverter',
        priorityFactors: {
          efficiency: equipmentSelection.panel.efficiency,
          reliability: equipmentSelection.panel.aiIntelligence?.reliabilityScore || 90,
          cost: equipmentSelection.totalCost / equipmentSelection.configuration.totalPowerDC,
          compatibility: equipmentSelection.compatibility ? Number(equipmentSelection.compatibility.overallScore) : 85,
        },
      },
      systemConfiguration: {
        arrayConfiguration: equipmentSelection.configuration.stringConfiguration,
        orientation: designRequirements.orientation,
        tilt: designRequirements.tilt,
        estimatedProduction: performanceEstimates.annualProduction,
        specificYield: performanceEstimates.specificYield,
        performanceRatio: performanceEstimates.performanceRatio,
        systemEfficiency: performanceEstimates.systemEfficiency,
      },
      performanceEstimates: {
        annualProduction: performanceEstimates.annualProduction,
        monthlyProduction: performanceEstimates.monthlyProduction,
        specificYield: performanceEstimates.specificYield,
        performanceRatio: performanceEstimates.performanceRatio,
        systemEfficiency: performanceEstimates.systemEfficiency,
        lifetimeProduction: performanceEstimates.lifetimeProduction,
        degradationProfile: performanceEstimates.degradationProfile,
        financialMetrics: performanceEstimates.financialMetrics,
        environmentalBenefits: performanceEstimates.environmentalBenefits,
      },
      complianceResults: {
        electricalCodeCompliant: complianceResults.electricalCodeCompliant,
        buildingCodeCompliant: complianceResults.buildingCodeCompliant,
        utilityCompliant: complianceResults.utilityCompliant,
        complianceScore: complianceResults.complianceScore,
        issues: complianceResults.issues,
        recommendations: complianceResults.recommendations,
        protectionRequirements: complianceResults.protectionRequirements,
      },
      alternatives: [
        {
          description: 'Higher efficiency alternative',
          powerIncrease: '10-15%',
          costIncrease: '20-25%',
          suitableFor: 'Space-constrained installations',
        },
        {
          description: 'Cost-optimized alternative',
          costDecrease: '15-20%',
          efficiencyDecrease: '5-8%',
          suitableFor: 'Budget-sensitive projects',
        },
      ],
      processingTimeMs: Date.now() - startTime,
    };

    // Calculate confidence score based on various factors
    const confidenceFactors = {
      equipmentCompatibility: complianceResults.complianceScore,
      dataQuality: 90, // Based on AI intelligence availability
      requirementClarity: requirements.powerTarget ? 95 : 80,
      locationAccuracy: locationContext?.latitude ? 90 : 70,
    };

    const confidenceScore = Object.values(confidenceFactors).reduce((a, b) => a + b, 0) / Object.keys(confidenceFactors).length;

    // Update design with results
    await prisma.aiDesign.update({
      where: { id: designId },
      data: {
        designResult: results.designResult as any,
        equipmentSelections: results.equipmentSelections as any,
        systemConfiguration: results.systemConfiguration as any,
        performanceEstimates: results.performanceEstimates as any,
        complianceResults: results.complianceResults as any,
        alternatives: results.alternatives as any,
        status: 'COMPLETED',
        completedAt: new Date(),
        confidenceScore,
      }
    });

    console.log(`✅ AI design processing completed for ${designId} in ${Date.now() - startTime}ms`);
    console.log(`📈 Final configuration: ${equipmentSelection.configuration.totalPanels} panels, ${equipmentSelection.configuration.totalPowerDC}W DC`);
    console.log(`💰 Total cost: €${equipmentSelection.totalCost.toFixed(2)}, ROI: ${equipmentSelection.roi.toFixed(1)}%`);
    console.log(`🔋 Annual production: ${performanceEstimates.annualProduction.toFixed(0)} kWh`);

  } catch (error) {
    console.error('❌ Error processing AI design:', error);

    // Mark as failed with error details
    await prisma.aiDesign.update({
      where: { id: designId },
      data: {
        status: 'FAILED',
        designResult: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        } as any,
      }
    });
  }
}

async function performBasicCompatibilityCheck(panelId: number, inverterId: number) {
  try {
    const [panel, inverter] = await Promise.all([
      prisma.pVPanel.findUnique({
        where: { id: panelId },
        select: {
          id: true,
          maker: true,
          model: true,
          maxPower: true,
          openCircuitVoltage: true,
          shortCircuitCurrent: true,
          currentAtPmax: true,
          voltageAtPmax: true,
          tempCoeffVoc: true
        }
      }),
      prisma.inverter.findUnique({
        where: { id: inverterId },
        select: {
          id: true,
          maker: true,
          model: true,
          maxOutputPower: true,
          maxDcVoltage: true,
          maxInputCurrentPerMppt: true,
          mpptVoltageRangeMin: true,
          mpptVoltageRangeMax: true,
          maxShortCircuitCurrent: true
        }
      })
    ]);

    if (!panel || !inverter) {
      return {
        compatible: false,
        issues: ['Panel or inverter not found'],
        recommendations: [],
        score: 0
      };
    }

    const issues = [];
    const recommendations = [];

    // Voltage compatibility check
    const vocAtMinus10 = (panel.openCircuitVoltage || 0) * (1 + (panel.tempCoeffVoc || -0.3) / 100 * (-35));
    if (vocAtMinus10 > (inverter.maxDcVoltage || 0)) {
      issues.push(`Panel Voc at -10°C (${vocAtMinus10.toFixed(1)}V) exceeds inverter max voltage (${inverter.maxDcVoltage || 0}V)`);
      recommendations.push('Reduce panels per string or choose different inverter');
    }

    // Current compatibility check
    if ((panel.shortCircuitCurrent || 0) > (inverter.maxInputCurrentPerMppt || 0)) {
      issues.push(`Panel short-circuit current (${panel.shortCircuitCurrent}A) exceeds inverter MPPT current (${inverter.maxInputCurrentPerMppt}A)`);
      recommendations.push('Check parallel string configuration');
    }

    // Power compatibility check
    const typicalArraySize = 20;
    const totalPower = (panel.maxPower || 0) * typicalArraySize;
    if (totalPower > (inverter.maxOutputPower || 0) * 1.5) {
      issues.push(`Typical array power (${totalPower}W) may exceed inverter capacity`);
      recommendations.push('Consider larger inverter or fewer panels');
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations,
      score: Math.max(0, 100 - (issues.length * 25)),
      needsAIAnalysis: issues.length > 0,
      equipment: { panel, inverter }
    };
  } catch (error) {
    console.error('Error in basic compatibility check:', error);
    return {
      compatible: false,
      issues: ['Error performing compatibility check'],
      recommendations: [],
      score: 0
    };
  }
}