import express from 'express';
import { getAllIndustries, getIndustryById } from '../controllers/industryController';

const router = express.Router();

// GET all industries
router.get('/', getAllIndustries);

// GET industry by ID
router.get('/:id', getIndustryById);

export default router;
