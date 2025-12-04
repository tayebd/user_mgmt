import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All AI routes require authentication
router.use(authenticateToken);

// AI Design Management
router.post('/designs', aiController.createAIDesign);
router.get('/designs', aiController.getAIDesigns);
router.get('/designs/:designId', aiController.getAIDesign);
router.put('/designs/:designId', aiController.updateAIDesign);
router.delete('/designs/:designId', aiController.deleteAIDesign);

// AI Intelligence Routes
router.get('/panels/:panelId/intelligence', aiController.getPanelIntelligence);
router.get('/inverters/:inverterId/intelligence', aiController.getInverterIntelligence);
router.get('/compatibility/panel/:panelId/inverter/:inverterId', aiController.getCompatibilityAnalysis);

// User AI Preferences
router.get('/user/preferences', aiController.getUserAIPreferences);
router.put('/user/preferences', aiController.updateUserAIPreferences);

// AI Analytics
router.post('/designs/:designId/analytics', aiController.createDesignAnalytics);
router.get('/analytics', aiController.getAIAnalytics);

export default router;