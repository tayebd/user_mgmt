import express from 'express';
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/organizationController';

const router = express.Router();

router.get('/', getOrganizations);
router.get('/:organizationId', getOrganization);
router.post('/', createOrganization);
router.put('/:organizationId', updateOrganization);
router.delete('/:organizationId', deleteOrganization);

router.post('/:organizationId/reviews', createReview);
router.get('/:organizationId/reviews', getReviews);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
