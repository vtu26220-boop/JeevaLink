import { Router } from 'express';
import {
  getOfficialResources,
  getOrganDonationFAQs,
  submitExpressionOfInterest,
  getMyExpressionOfInterest,
  withdrawExpressionOfInterest,
} from '../controllers/organDonationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public educational info
router.get('/resources', getOfficialResources);
router.get('/faq', getOrganDonationFAQs);

// Optional community expression of interest (strictly non-legal registry)
router.post('/interest', authenticate, submitExpressionOfInterest);
router.get('/interest/me', authenticate, getMyExpressionOfInterest);
router.post('/interest/withdraw', authenticate, withdrawExpressionOfInterest);

export default router;
