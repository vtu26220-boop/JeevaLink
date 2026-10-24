import { Router } from 'express';
import {
  registerDonor,
  getDonors,
  getMyDonorProfile,
  updateMyDonorProfile,
  toggleAvailability,
  addDonationRecord,
  withdrawDonorListing,
} from '../controllers/donorController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public / filtered donor search
router.get('/', getDonors);

// Authenticated donor management
router.post('/', authenticate, registerDonor);
router.get('/me', authenticate, getMyDonorProfile);
router.patch('/me', authenticate, updateMyDonorProfile);
router.patch('/me/availability', authenticate, toggleAvailability);
router.post('/me/donation-history', authenticate, addDonationRecord);
router.post('/me/withdraw', authenticate, withdrawDonorListing);

export default router;
