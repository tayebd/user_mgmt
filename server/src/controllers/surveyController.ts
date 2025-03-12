import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getSurveys = async (req: Request, res: Response) => {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        responses: {
          select: {
            id: true,
            responseJson: true,
            processedMetrics: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response to include response count
    const formattedSurveys = surveys.map(survey => ({
      ...survey,
      responseCount: survey.responses?.length || 0,
      responses: undefined // Don't send full responses in survey list
    }));

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
      userId,
      targetResponses = 0,
      // Ignore fields that don't exist in our schema
      active, // Not in schema, ignore
      responseCount // Not in schema, ignore
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !surveyJson || !userId) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, surveyJson, and userId are required',
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
  
  const { responseJson, userId } = req.body;
  console.log('Extracted values:', { surveyId, responseJson: !!responseJson, userId });
  
  if (!responseJson) {
    return res.status(400).json({ 
      message: 'responseJson is required',
      receivedBody: req.body
    });
  }
  
  if (!userId) {
    return res.status(400).json({ 
      message: 'userId is required',
      receivedBody: req.body
    });
  }

  try {
    let parsedResponse;
    try {
      parsedResponse = typeof responseJson === 'string' ? JSON.parse(responseJson) : responseJson;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid JSON in responseJson',
        error: parseError
      });
    }
    
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: Number(surveyId),
        responseJson: parsedResponse,
        userId: Number(userId),
      },
    });
    res.status(201).json(surveyResponse);
  } catch (error) {
    console.error('Error creating survey response:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error,
      stack: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
  
  export const getSurveyResponses = async (req: Request, res: Response) => {
    const { surveyId } = req.params;
    try {
      const reviews = await prisma.surveyResponse.findMany({
        where: { surveyId: Number(surveyId) },
        include: {
          // responseJson: true,
        },
      });
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
