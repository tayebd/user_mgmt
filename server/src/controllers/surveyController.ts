import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { MetricSyncService } from '../services/metricSyncService';
import { ProcessedMetrics } from '../types/metrics';
import { Prisma, SurveyResponse } from '@prisma/client';

const CURRENT_METRICS_VERSION = '1.0.0';

export const getSurveys = async (req: Request, res: Response) => {
  try {
    type SurveyWithResponses = Prisma.SurveyGetPayload<{
      include: {
        responses: {
          select: {
            id: true;
            responseJson: true;
            processedMetrics: true;
            createdAt: true;
            companyId: true;
            metricsVersion: true;
            lastMetricsUpdate: true;
          };
        };
      };
    }>;

    const surveys = await prisma.survey.findMany({
      include: {
        responses: {
          select: {
            id: true,
            responseJson: true,
            processedMetrics: true,
            createdAt: true,
            companyId: true,
            metricsVersion: true,
            lastMetricsUpdate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response to include response count and validate JSON
    const formattedSurveys = (surveys as SurveyWithResponses[]).map(survey => {
      const validResponses = survey.responses.filter(response => {
        try {
          const json = response.responseJson;
          return json !== null && 
                 (typeof json === 'object' || typeof json === 'string');
        } catch (e) {
          console.warn(
            'Invalid response JSON:', 
            { surveyId: survey.id, responseId: response.id, error: e }
          );
          return false;
        }
      });

      return {
        ...survey,
        responseCount: validResponses.length,
        responses: undefined // Don't send full responses in survey list
      };
    });

    res.status(200).json(formattedSurveys);
  } catch (error) {
    console.error('Error fetching surveys:', {
      error,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      message: 'Failed to fetch surveys',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSurvey = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: Number(surveyId) },
      include: {
        // // title: true,
        // description: true,
        // surveyJson: true,
      },
    });
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.status(200).json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSurvey = async (req: Request, res: Response) => {
  try {
    // Extract fields from request body
    const { 
      title, 
      description, 
      surveyJson, 
      targetResponses = 0,
      userId
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !surveyJson) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, and surveyJson are required',
        receivedBody: {
          title: !!title,
          description: !!description,
          surveyJson: !!surveyJson,
          userId: !!userId
        }
      });
    }

    // Log the request for debugging
    console.log('Creating survey with:', {
      title,
      description: description?.substring(0, 30) + '...',
      jsonLength: surveyJson?.length,
      userId
    });
  
    // Create the survey
    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        surveyJson,
        userId: Number(userId),
        targetResponses: Number(targetResponses) || 0,
        // status will default to DRAFT as defined in the schema
      },
    });
    
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    // Return more detailed error information
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateSurvey = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { title, description, surveyJson} = req.body;
  try {
    const survey = await prisma.survey.update({
      where: { id: Number(surveyId) },
      data: {
        title,
        description,
        surveyJson,
      },
    });
    res.status(200).json(survey);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSurvey = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  try {
    await prisma.survey.delete({
      where: { id: Number(surveyId) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSurveyResponse = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  console.log('Request body received:', req.body);

  const { responseJson, companyId, processedMetrics, userId } = req.body;
  
  console.log('Extracted values:', { 
    surveyId, 
    responseJson: !!responseJson, 
    userId,
    companyId,
    hasMetrics: !!processedMetrics
  });
  
  if (!responseJson) {
    return res.status(400).json({ 
      message: 'responseJson is required',
      receivedBody: req.body
    });
  }

  if (!companyId) {
    return res.status(400).json({ 
      message: 'companyId is required for dashboard integration',
      receivedBody: req.body
    });
  }

  try {
    // Validate and parse response JSON
    let parsedResponse: Record<string, unknown>;
    try {
      const tempResponse = typeof responseJson === 'string' ? JSON.parse(responseJson) : responseJson;
      if (!tempResponse || typeof tempResponse !== 'object' || Array.isArray(tempResponse)) {
        throw new Error('Response must be a valid object');
      }
      parsedResponse = tempResponse;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid JSON in responseJson',
        error: parseError instanceof Error ? parseError.message : 'Parse error'
      });
    }

    // Validate processed metrics if provided
    let validatedMetrics: ProcessedMetrics | undefined;
    if (processedMetrics) {
      try {
        if (!processedMetrics.timestamp || !processedMetrics.metrics || !processedMetrics.confidenceScores) {
          throw new Error('Invalid metrics format');
        }
        validatedMetrics = processedMetrics as ProcessedMetrics;
      } catch (metricsError) {
        return res.status(400).json({
          message: 'Invalid metrics format',
          error: metricsError instanceof Error ? metricsError.message : 'Validation error'
        });
      }
    }

    // Create survey response with validated data
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: Number(surveyId),
        responseJson: parsedResponse as Prisma.InputJsonValue,
        userId: userId, // Use authenticated user ID
        companyId: Number(companyId),
        metricsVersion: validatedMetrics ? CURRENT_METRICS_VERSION : null,
        lastMetricsUpdate: validatedMetrics ? new Date() : null,
        processedMetrics: validatedMetrics ? (validatedMetrics as unknown as Prisma.InputJsonValue) : Prisma.JsonNull
      },
      include: {
        survey: true,
        user: true,
        company: true
      }
    });

    // If metrics were provided and validated, sync them with dashboard tables
    if (validatedMetrics) {
      try {
        await MetricSyncService.syncMetricsWithDashboard(
          surveyResponse.id,
          validatedMetrics,
          Number(companyId)
        );
      } catch (syncError) {
        console.error('Error syncing metrics with dashboard:', syncError);
        // Don't fail the response creation if sync fails, but log it
        if (process.env.NODE_ENV === 'development') {
          console.error('Sync error details:', syncError);
        }
      }
    }

    res.status(201).json(surveyResponse);
  } catch (error) {
    console.error('Error creating survey response:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
  
  export const getSurveyResponses = async (req: Request, res: Response) => {
    const { surveyId } = req.params;
    try {
      // Validate surveyId
      if (!surveyId || isNaN(Number(surveyId))) {
        return res.status(400).json({ message: 'Invalid survey ID' });
      }

      const surveyResponses = await prisma.surveyResponse.findMany({
        where: { surveyId: Number(surveyId) },
        select: {
          id: true,
          surveyId: true,
          userId: true,
          companyId: true,
          responseJson: true,
          processedMetrics: true,
          createdAt: true,
          metricsVersion: true,
          lastMetricsUpdate: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Log the number of responses found
      console.log(`Found ${surveyResponses.length} responses for survey ${surveyId}`);
      
      res.status(200).json(surveyResponses);
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const updateSurveyResponse = async (req: Request, res: Response) => {
    const { responseId } = req.params;
    const { responseJson } = req.body;
    try {
      const review = await prisma.surveyResponse.update({
        where: { id: Number(responseId) },
        data: {
          responseJson,
        },
      });
      res.status(200).json(review);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const deleteSurveyResponse = async (req: Request, res: Response) => {
    const { responseId } = req.params;
    try {
      await prisma.surveyResponse.delete({
        where: { id: Number(responseId) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
