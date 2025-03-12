import { prisma } from '../config/db';
import { ProcessedMetrics, DashboardMetrics } from '../types/metrics';
import { Prisma } from '@prisma/client';

const CURRENT_METRICS_VERSION = '1.0.0';

export class MetricSyncService {
  /**
   * Synchronizes processed survey metrics with dashboard tables
   */
  static async syncMetricsWithDashboard(
    surveyResponseId: number,
    processedMetrics: ProcessedMetrics,
    companyId: number
  ) {
    try {
      const timestamp = new Date();

      // Begin transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // 1. Update survey response metrics
        await tx.surveyResponse.update({
          where: { id: surveyResponseId },
          data: {
            processedMetrics: !processedMetrics ? Prisma.JsonNull : (() => {
              try {
                // Validate required fields exist
                if (!processedMetrics.timestamp || !processedMetrics.metrics || !processedMetrics.confidenceScores) {
                  throw new Error('Missing required fields in processedMetrics');
                }

                // First validate and normalize the data structure
                const validatedMetrics = {
                  timestamp: String(processedMetrics.timestamp),
                  metrics: {
                    ...processedMetrics.metrics,
                    // Ensure any numeric values are properly converted
                    technologyMetrics: processedMetrics.metrics.technologyMetrics ? {
                      ...processedMetrics.metrics.technologyMetrics,
                      implementationCount: Number(processedMetrics.metrics.technologyMetrics.implementationCount) || 0,
                      averageMaturity: Number(processedMetrics.metrics.technologyMetrics.averageMaturity) || 0,
                      maturityScore: Number(processedMetrics.metrics.technologyMetrics.maturityScore) || 0
                    } : {},
                    processMetrics: processedMetrics.metrics.processMetrics ? {
                      ...processedMetrics.metrics.processMetrics,
                      digitizationLevel: Number(processedMetrics.metrics.processMetrics.digitizationLevel) || 0,
                      automationLevel: Number(processedMetrics.metrics.processMetrics.automationLevel) || 0
                    } : {}
                  },
                  confidenceScores: {
                    technology: Number(processedMetrics.confidenceScores.technology) || 0,
                    process: Number(processedMetrics.confidenceScores.process) || 0,
                    personnel: Number(processedMetrics.confidenceScores.personnel) || 0,
                    strategy: Number(processedMetrics.confidenceScores.strategy) || 0
                  }
                };
                
                // Then serialize and parse to ensure it's a valid JSON object
                // This also removes any potential circular references
                const jsonString = JSON.stringify(validatedMetrics);
                if (!jsonString) {
                  throw new Error('Failed to serialize metrics');
                }
                
                return JSON.parse(jsonString) as Prisma.InputJsonValue;
              } catch (error) {
                console.error('Error processing metrics:', error);
                return Prisma.JsonNull;
              }
            })(),
            metricsVersion: CURRENT_METRICS_VERSION,
            lastMetricsUpdate: timestamp,
            companyId
          }
        });

        // 2. Sync technology implementations
        await this.syncTechnologyImplementations(tx, companyId, processedMetrics.metrics.technologyMetrics);

        // 3. Sync digital processes
        await this.syncDigitalProcesses(tx, companyId, processedMetrics.metrics.processMetrics);

        // 4. Sync personnel skills
        await this.syncPersonnelSkills(tx, companyId, processedMetrics.metrics.personnelMetrics);

        // 5. Sync strategy assessment
        await this.syncStrategyAssessment(tx, companyId, processedMetrics.metrics.strategyMetrics);
      });

      console.log(`Successfully synced metrics for survey response ${surveyResponseId}`);
    } catch (error) {
      console.error('Error syncing metrics with dashboard:', error);
      throw new Error(`Failed to sync metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async syncTechnologyImplementations(
    tx: any,
    companyId: number,
    techMetrics: DashboardMetrics['technologyMetrics']
  ) {
    // Ensure technology types exist
    for (const tech of techMetrics.implementedTechnologies) {
      const techType = await tx.technologyType.upsert({
        where: { name: tech },
        create: {
          name: tech,
          category: 'IT_SYSTEMS',
          description: `${tech} implementation`
        },
        update: {}
      });

      // Create or update implementation
      await tx.technologyImplementation.upsert({
        where: {
          companyId_technologyTypeId: {
            companyId,
            technologyTypeId: techType.id
          }
        },
        create: {
          companyId,
          technologyTypeId: techType.id,
          implementationDate: new Date(),
          maturityLevel: Math.round(techMetrics.averageMaturity * 5), // Convert 0-1 to 0-5 scale
          status: 'ACTIVE',
          investmentAmount: 0 // Default value, should be updated with actual data
        },
        update: {
          maturityLevel: Math.round(techMetrics.averageMaturity * 5),
          updatedAt: new Date()
        }
      });
    }
  }

  private static async syncDigitalProcesses(
    tx: any,
    companyId: number,
    processMetrics: DashboardMetrics['processMetrics']
  ) {
    // Create generic process type if needed
    const processType = await tx.processType.upsert({
      where: { name: 'GENERAL_BUSINESS_PROCESS' },
      create: {
        name: 'GENERAL_BUSINESS_PROCESS',
        category: 'BUSINESS',
        description: 'General business process digitization and automation'
      },
      update: {}
    });

    // Update or create digital process record
    await tx.digitalProcess.upsert({
      where: {
        companyId_processTypeId: {
          companyId,
          processTypeId: processType.id
        }
      },
      create: {
        companyId,
        processTypeId: processType.id,
        digitizationLevel: Math.round(processMetrics.digitizationLevel * 5),
        automationLevel: Math.round(processMetrics.automationLevel * 5),
        implementationDate: new Date(),
        lastAssessmentDate: new Date()
      },
      update: {
        digitizationLevel: Math.round(processMetrics.digitizationLevel * 5),
        automationLevel: Math.round(processMetrics.automationLevel * 5),
        lastAssessmentDate: new Date()
      }
    });
  }

  private static async syncPersonnelSkills(
    tx: any,
    companyId: number,
    personnelMetrics: DashboardMetrics['personnelMetrics']
  ) {
    // Create generic digital skill type
    const digitalSkill = await tx.skill.upsert({
      where: { name: 'DIGITAL_COMPETENCY' },
      create: {
        name: 'DIGITAL_COMPETENCY',
        category: 'TECHNICAL',
        i40Relevance: true,
        description: 'General digital and technical competency'
      },
      update: {}
    });

    // Update or create personnel skill record
    await tx.personnelSkill.upsert({
      where: {
        companyId_skillId: {
          companyId,
          skillId: digitalSkill.id
        }
      },
      create: {
        companyId,
        skillId: digitalSkill.id,
        numberOfPersonnel: personnelMetrics.totalSkilled,
        proficiencyLevel: Math.round(personnelMetrics.avgProficiency * 5),
        assessmentDate: new Date()
      },
      update: {
        numberOfPersonnel: personnelMetrics.totalSkilled,
        proficiencyLevel: Math.round(personnelMetrics.avgProficiency * 5),
        assessmentDate: new Date()
      }
    });
  }

  private static async syncStrategyAssessment(
    tx: any,
    companyId: number,
    strategyMetrics: DashboardMetrics['strategyMetrics']
  ) {
    // Update or create strategy assessment
    await tx.strategyAssessment.upsert({
      where: { companyId },
      create: {
        companyId,
        assessmentDate: new Date(),
        hasI40Strategy: true,
        strategyMaturity: Math.round(strategyMetrics.strategyMaturity * 5),
        implementationProgress: Math.round(strategyMetrics.implementationProgress * 100),
        nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
      },
      update: {
        assessmentDate: new Date(),
        strategyMaturity: Math.round(strategyMetrics.strategyMaturity * 5),
        implementationProgress: Math.round(strategyMetrics.implementationProgress * 100),
        nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      }
    });
  }
}
