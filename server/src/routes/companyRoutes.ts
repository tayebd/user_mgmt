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

router.get('/', getCompanies);
router.get('/:companyId', getCompany);
router.post('/', createCompany);
router.put('/:companyId', updateCompany);
router.delete('/:companyId', deleteCompany);

router.post('/:companyId/reviews', createReview);
router.get('/:companyId/reviews', getReviews);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
