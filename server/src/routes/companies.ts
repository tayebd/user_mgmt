import express from 'express';
import { getCompanies } from '../controllers/companyController';

const router = express.Router();

router.get('/companies', getCompanies);

export default router; 