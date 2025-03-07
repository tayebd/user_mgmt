import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getSurveys = async (req: Request, res: Response) => {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        // title: true,
        // description: true,
        // surveyJson: true,
      },
    });
    res.status(200).json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSurvey = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
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
  const { title, description, surveyJson} = req.body;
  try {
    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        surveyJson,
      },
    });
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSurvey = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { title, description, surveyJson} = req.body;
  try {
    const survey = await prisma.survey.update({
      where: { id: surveyId },
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
      where: { id: surveyId },
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
        surveyId,
        responseJson: parsedResponse,
        userId,
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
        where: { surveyId },
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
        where: { id: responseId },
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
        where: { id: responseId },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
