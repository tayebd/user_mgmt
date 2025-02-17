import express from 'express';
import {
  getPVPanels,
  getPVPanel,
  createPVPanel,
  updatePVPanel,
  deletePVPanel,
} from '../controllers/pvPanelController';

const router = express.Router();

router.get('/pv-panels', getPVPanels);
router.get('/pv-panels/:pvPanelId', getPVPanel);
router.post('/pv-panels', createPVPanel);
router.put('/pv-panels/:pvPanelId', updatePVPanel);
router.delete('/pv-panels/:pvPanelId', deletePVPanel);

export default router;
