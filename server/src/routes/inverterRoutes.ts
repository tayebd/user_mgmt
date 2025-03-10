import express from 'express';
import {
  getInverters,
  getInverter,
  createInverter,
  updateInverter,
  deleteInverter,
} from '../controllers/inverterController';

const router = express.Router();

router.get('/', getInverters);
router.get('/:inverterId', getInverter);
router.post('/', createInverter);
router.put('/:inverterId', updateInverter);
router.delete('/:inverterId', deleteInverter);

export default router;
