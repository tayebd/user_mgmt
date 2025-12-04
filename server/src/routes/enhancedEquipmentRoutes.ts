import { Router } from 'express';
import * as enhancedEquipmentController from '../controllers/enhancedEquipmentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Enhanced equipment endpoints (require authentication)
router.use(authenticateToken);

// Enhanced Panel APIs
router.get('/pv-panels', enhancedEquipmentController.getEnhancedPVPanels);
router.get('/pv-panels/:panelId', enhancedEquipmentController.getEnhancedPVPanel);
router.get('/panels/:panelId/intelligence', enhancedEquipmentController.getPanelIntelligence);

// Enhanced Inverter APIs
router.get('/inverters', enhancedEquipmentController.getEnhancedInverters);
router.get('/inverters/:inverterId/intelligence', enhancedEquipmentController.getInverterIntelligence);

// Compatibility Analysis
router.get('/compatibility/panel/:panelId/inverter/:inverterId', enhancedEquipmentController.getCompatibilityAnalysis);

export default router;