import express from 'express';
import {
  getPVPanels,
  getPVPanel,
  createPVPanel,
  updatePVPanel,
  deletePVPanel,
} from '../controllers/pvPanelController';

const router = express.Router();

// Use root routes since the base path is already set in index.ts as '/api/pv-panels'
router.get('/', getPVPanels);
router.get('/:pvPanelId', getPVPanel);
router.post('/', createPVPanel);
router.put('/:pvPanelId', updatePVPanel);
router.delete('/:pvPanelId', deletePVPanel);

export default router;
