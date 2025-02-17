import express from 'express';
import {
  getInverters,
  getInverter,
  createInverter,
  updateInverter,
  deleteInverter,
} from '../controllers/inverterController';

const router = express.Router();

router.get('/inverters', getInverters);
router.get('/inverters/:inverterId', getInverter);
router.post('/inverters', createInverter);
router.put('/inverters/:inverterId', updateInverter);
router.delete('/inverters/:inverterId', deleteInverter);

export default router;
