import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  try {
    // Seed Technology Types
    const technologyTypes = await Promise.all([
      prisma.technologyType.create({
        data: {
          name: 'Industrial IoT Sensors',
          category: 'IoT',
          description: 'Smart sensors for industrial equipment monitoring'
        }
      }),
      prisma.technologyType.create({
        data: {
          name: 'Predictive Maintenance AI',
          category: 'AI',
          description: 'AI system for predicting equipment maintenance needs'
        }
      }),
      prisma.technologyType.create({
        data: {
          name: 'Cloud Manufacturing Platform',
          category: 'Cloud',
          description: 'Cloud-based manufacturing execution system'
        }
      }),
      prisma.technologyType.create({
        data: {
          name: 'Collaborative Robots',
          category: 'Robotics',
          description: 'Robots designed to work alongside human workers'
        }
      })
    ]);

    // Seed Process Types
    const processTypes = await Promise.all([
      prisma.processType.create({
        data: {
          name: 'Production Planning',
          category: 'Production',
          description: 'Digital production planning and scheduling'
        }
      }),
      prisma.processType.create({
        data: {
          name: 'Quality Control',
          category: 'Production',
          description: 'Automated quality control and inspection'
        }
      }),
      prisma.processType.create({
        data: {
          name: 'Digital HR Management',
          category: 'HR',
          description: 'Digital HR processes and employee management'
        }
      })
    ]);

    // Seed Skills
    const skills = await Promise.all([
      prisma.skill.create({
        data: {
          name: 'IoT System Management',
          category: 'Technical',
          i40Relevance: true,
          description: 'Ability to manage and maintain IoT systems'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Data Analytics',
          category: 'Technical',
          i40Relevance: true,
          description: 'Skills in analyzing industrial data'
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Digital Process Management',
          category: 'Management',
          i40Relevance: true,
          description: 'Managing digitized industrial processes'
        }
      })
    ]);

    // Get existing organizations
    const organizations = await prisma.organization.findMany({
      include: { industry: true }
    });

    // Seed data for each organization
    for (const organization of organizations) {
      // Technology Implementations
      for (const tech of technologyTypes) {
        if (Math.random() > 0.3) { // 70% chance of implementation
          await prisma.technologyImplementation.create({
            data: {
              organizationId: organization.id,
              technologyTypeId: tech.id,
              implementationDate: faker.date.past(),
              maturityLevel: faker.number.int({ min: 1, max: 4 }),
              status: faker.helpers.arrayElement(['Planning', 'InProgress', 'Completed']),
              investmentAmount: faker.number.float({ min: 10000, max: 100000 })
            }
          });
        }
      }

      // Digital Processes
      for (const process of processTypes) {
        if (Math.random() > 0.4) { // 60% chance of implementation
          await prisma.digitalProcess.create({
            data: {
              organizationId: organization.id,
              processTypeId: process.id,
              digitizationLevel: faker.number.int({ min: 1, max: 5 }),
              automationLevel: faker.number.int({ min: 1, max: 5 }),
              implementationDate: faker.date.past(),
              lastAssessmentDate: faker.date.recent()
            }
          });
        }
      }

      // Personnel Skills
      for (const skill of skills) {
        if (Math.random() > 0.3) { // 70% chance of having skilled personnel
          await prisma.personnelSkill.create({
            data: {
              organizationId: organization.id,
              skillId: skill.id,
              numberOfPersonnel: faker.number.int({ min: 5, max: 50 }),
              proficiencyLevel: faker.number.int({ min: 1, max: 5 }),
              assessmentDate: faker.date.recent()
            }
          });
        }
      }

      // Strategy Assessment
      await prisma.strategyAssessment.create({
        data: {
          organizationId: organization.id,
          assessmentDate: faker.date.recent(),
          hasI40Strategy: Math.random() > 0.4,
          strategyMaturity: faker.number.int({ min: 1, max: 5 }),
          implementationProgress: faker.number.int({ min: 0, max: 100 }),
          nextReviewDate: faker.date.future()
        }
      });

      // Product Innovation
      await prisma.productInnovation.create({
        data: {
          organizationId: organization.id,
          smartFeaturesCount: faker.number.int({ min: 0, max: 10 }),
          customizationLevel: faker.number.int({ min: 1, max: 5 }),
          innovationDate: faker.date.past()
        }
      });

      // Generate initial fact tables
      await generateFactTables(organization.id, organization.industryId);
    }

    console.log('Analytics seed data created successfully');
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    throw error;
  }
}

async function generateFactTables(organizationId: number, sectorId: number) {
  const date = new Date();
  
  // Generate facts for the last 12 months
  for (let i = 0; i < 12; i++) {
    date.setMonth(date.getMonth() - 1);
    
    await Promise.all([
      prisma.technologyImplementationFact.create({
        data: {
          date: new Date(date),
          organizationId,
          sectorId,
          technologyCount: faker.number.int({ min: 1, max: 10 }),
          avgMaturityLevel: faker.number.float({ min: 1, max: 4, fractionDigits: 1 }),
          totalInvestment: faker.number.float({ min: 50000, max: 500000 }),
          implementationStatusCounts: {
            Planning: faker.number.int({ min: 0, max: 3 }),
            InProgress: faker.number.int({ min: 0, max: 4 }),
            Completed: faker.number.int({ min: 1, max: 5 })
          }
        }
      }),
      prisma.processDigitizationFact.create({
        data: {
          date: new Date(date),
          organizationId,
          sectorId,
          processId: faker.number.int({ min: 1, max: 3 }),
          avgDigitizationLevel: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          avgAutomationLevel: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          processCount: faker.number.int({ min: 1, max: 5 })
        }
      }),
      prisma.personnelSkillsFact.create({
        data: {
          date: new Date(date),
          organizationId,
          sectorId,
          skillCategory: faker.helpers.arrayElement(['Technical', 'Management', 'Operation']),
          totalSkilledPersonnel: faker.number.int({ min: 10, max: 100 }),
          avgProficiencyLevel: faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
        }
      }),
      prisma.strategyImplementationFact.create({
        data: {
          date: new Date(date),
          organizationId,
          sectorId,
          organizationsWithStrategy: faker.number.int({ min: 0, max: 1 }),
          avgStrategyMaturity: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          avgImplementationProgress: faker.number.float({ min: 0, max: 100, fractionDigits: 1 })
        }
      })
    ]);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
