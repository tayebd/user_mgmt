import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const technologyImplementationSchema = z.object({
  organizationId: z.number(),
  technologyTypeId: z.number(),
  implementationDate: z.string().datetime(),
  maturityLevel: z.number().min(1).max(4),
  status: z.enum(['Planning', 'InProgress', 'Completed']),
  investmentAmount: z.number()
});

const digitalProcessSchema = z.object({
  organizationId: z.number(),
  processTypeId: z.number(),
  digitizationLevel: z.number().min(1).max(5),
  automationLevel: z.number().min(1).max(5),
  implementationDate: z.string().datetime(),
  lastAssessmentDate: z.string().datetime()
});

const personnelSkillSchema = z.object({
  organizationId: z.number(),
  skillId: z.number(),
  numberOfPersonnel: z.number().min(0),
  proficiencyLevel: z.number().min(1).max(5),
  assessmentDate: z.string().datetime()
});

// Error handler wrapper
const handleErrors = (fn: (req: Request, res: Response) => Promise<void>) => async (req: Request, res: Response) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Routes for data ingestion
router.post('/technology-implementation', 
  validateRequest({ body: technologyImplementationSchema }),
  handleErrors(async (req: Request, res: Response) => {
    const implementation = await prisma.technologyImplementation.create({
      data: req.body
    });
    await updateTechnologyFacts(implementation.organizationId);
    res.json(implementation);
  })
);

router.post('/digital-process',
  validateRequest({ body: digitalProcessSchema }),
  handleErrors(async (req: Request, res: Response) => {
    const process = await prisma.digitalProcess.create({
      data: req.body
    });
    await updateProcessFacts(process.organizationId);
    res.json(process);
  })
);

router.post('/personnel-skill',
  validateRequest({ body: personnelSkillSchema }),
  handleErrors(async (req: Request, res: Response) => {
    const skill = await prisma.personnelSkill.create({
      data: req.body
    });
    await updatePersonnelFacts(skill.organizationId);
    res.json(skill);
  })
);

// Helper functions for fact table updates
async function updateTechnologyFacts(organizationId: number) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      industry: true,
      technologyImplementations: {
        include: { technologyType: true }
      }
    }
  });

  if (!organization) return;

  const implementations = organization.technologyImplementations;
  const statusCounts = implementations.reduce((acc, impl) => {
    acc[impl.status] = (acc[impl.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  await prisma.technologyImplementationFact.create({
    data: {
      date: new Date(),
      organizationId: organization.id,
      sectorId: organization.industryId,
      technologyCount: implementations.length,
      avgMaturityLevel: implementations.reduce((sum, impl) => sum + impl.maturityLevel, 0) / implementations.length,
      totalInvestment: implementations.reduce((sum, impl) => sum + Number(impl.investmentAmount), 0),
      implementationStatusCounts: statusCounts
    }
  });
}

async function updateProcessFacts(organizationId: number) {
  const processes = await prisma.digitalProcess.findMany({
    where: { organizationId },
    include: { processType: true }
  });

  await prisma.processDigitizationFact.create({
    data: {
      date: new Date(),
      organizationId,
      sectorId: (await prisma.organization.findUnique({ where: { id: organizationId } }))!.industryId,
      processId: processes[0]?.processTypeId || 0,
      avgDigitizationLevel: processes.reduce((sum, proc) => sum + proc.digitizationLevel, 0) / processes.length,
      avgAutomationLevel: processes.reduce((sum, proc) => sum + proc.automationLevel, 0) / processes.length,
      processCount: processes.length
    }
  });
}

async function updatePersonnelFacts(organizationId: number) {
  const skills = await prisma.personnelSkill.findMany({
    where: { organizationId },
    include: { skill: true }
  });

  await prisma.personnelSkillsFact.create({
    data: {
      date: new Date(),
      organizationId,
      sectorId: (await prisma.organization.findUnique({ where: { id: organizationId } }))!.industryId,
      skillCategory: skills[0]?.skill.category || 'Unknown',
      totalSkilledPersonnel: skills.reduce((sum, skill) => sum + skill.numberOfPersonnel, 0),
      avgProficiencyLevel: skills.reduce((sum, skill) => sum + skill.proficiencyLevel, 0) / skills.length
    }
  });
}

// Analytics extraction endpoints
router.get('/organization/:id/i40-metrics', handleErrors(async (req, res) => {
  const { id } = req.params;
  const organizationId = parseInt(id);

  const [
    techFacts,
    processFacts,
    personnelFacts,
    strategyFacts
  ] = await Promise.all([
    prisma.technologyImplementationFact.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 12 // Last 12 records
    }),
    prisma.processDigitizationFact.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 12
    }),
    prisma.personnelSkillsFact.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 12
    }),
    prisma.strategyImplementationFact.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' },
      take: 12
    })
  ]);

  res.json({
    technologyMetrics: {
      current: techFacts[0],
      trend: techFacts
    },
    processMetrics: {
      current: processFacts[0],
      trend: processFacts
    },
    personnelMetrics: {
      current: personnelFacts[0],
      trend: personnelFacts
    },
    strategyMetrics: {
      current: strategyFacts[0],
      trend: strategyFacts
    }
  });
}));

router.get('/sector/:id/i40-metrics', handleErrors(async (req, res) => {
  const { id } = req.params;
  const sectorId = parseInt(id);
  const date = new Date();
  date.setMonth(date.getMonth() - 1);

  const [techStats, processStats, personnelStats] = await Promise.all([
    prisma.technologyImplementationFact.aggregate({
      where: { 
        sectorId,
        date: { gte: date }
      },
      _avg: {
        avgMaturityLevel: true,
        technologyCount: true
      }
    }),
    prisma.processDigitizationFact.aggregate({
      where: { 
        sectorId,
        date: { gte: date }
      },
      _avg: {
        avgDigitizationLevel: true,
        avgAutomationLevel: true
      }
    }),
    prisma.personnelSkillsFact.aggregate({
      where: { 
        sectorId,
        date: { gte: date }
      },
      _avg: {
        avgProficiencyLevel: true,
        totalSkilledPersonnel: true
      }
    })
  ]);

  res.json({
    technologyStats: techStats._avg,
    processStats: processStats._avg,
    personnelStats: personnelStats._avg
  });
}));

export default router;
