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

router.get('/', getSurveys);
router.get('/:surveyId', getSurvey);
router.post('/', createSurvey);
router.put('/:surveyId', updateSurvey);
router.delete('/:surveyId', deleteSurvey);


router.post('/:surveyId/surveyResponses', createSurveyResponse);
router.get('/:surveyId/surveyResponses', getSurveyResponses);
router.put('/surveyResponses/:surveyResponseId', updateSurveyResponse);
router.delete('/surveyResponses/:surveyResponseId', deleteSurveyResponse);

export default router;
