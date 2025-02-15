import express from 'express';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/companyController';

const router = express.Router();

router.get('/companies', getCompanies);
router.get('/companies/:companyId', getCompany);
router.post('/companies', createCompany);
router.put('/companies/:companyId', updateCompany);
router.delete('/companies/:companyId', deleteCompany);

router.post('/companies/:companyId/reviews', createReview);
router.get('/companies/:companyId/reviews', getReviews);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
