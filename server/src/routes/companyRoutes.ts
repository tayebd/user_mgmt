import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} from '../controllers/companyController';

const router = express.Router();

router.get('/', getCompanies);
router.get('/:companyId', getCompany);
router.post('/', authenticateToken, createCompany);
router.put('/:companyId', authenticateToken, updateCompany);
router.delete('/:companyId', authenticateToken, deleteCompany);

export default router;
