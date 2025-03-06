import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  createSurveyResponse,
  getSurveyResponses,
  updateSurveyResponse,
  deleteSurveyResponse,
} from '../controllers/surveyController';

const router = express.Router();

router.get('/surveys', getSurveys);
router.get('/surveys/:surveyId', getSurvey);
router.post('/surveys', createSurvey);
router.put('/surveys/:surveyId', updateSurvey);
router.delete('/surveys/:surveyId', deleteSurvey);


router.post('/surveys/:surveyId/surveyResponses', createSurveyResponse);
router.get('/surveys/:surveyId/surveyResponses', getSurveyResponses);
router.put('/surveyResponses/:surveyResponseId', updateSurveyResponse);
router.delete('/surveyResponses/:surveyResponseId', deleteSurveyResponse);

export default router;
