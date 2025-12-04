import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  createSurveyResponse,
  getSurveyResponses,
  getSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
} from '../controllers/surveyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes - require authentication

router.get('/', getSurveys);
router.get('/:surveyId', getSurvey);

router.post('/', authenticateToken, createSurvey);
router.put('/:surveyId', authenticateToken, updateSurvey);
router.delete('/:surveyId', authenticateToken, deleteSurvey);

// Survey response routes - all require authentication
router.post('/:surveyId/surveyResponses', authenticateToken, createSurveyResponse);
router.get('/:surveyId/surveyResponses', authenticateToken, getSurveyResponses);
router.get('/surveyResponses/:surveyResponseId', authenticateToken, getSurveyResponse);
router.put('/surveyResponses/:surveyResponseId', authenticateToken, updateSurveyResponse);
router.delete('/surveyResponses/:surveyResponseId', authenticateToken, deleteSurveyResponse);

export default router;
