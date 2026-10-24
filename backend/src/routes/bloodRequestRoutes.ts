import { Router } from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  getMyBloodRequests,
  updateBloodRequest,
  cancelBloodRequest,
} from '../controllers/bloodRequestController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public / filtered list
router.get('/', getBloodRequests);

// Authenticated requester endpoints
router.get('/me', authenticate, getMyBloodRequests);
router.post('/', authenticate, createBloodRequest);
router.get('/:id', getBloodRequestById);
router.patch('/:id', authenticate, updateBloodRequest);
router.post('/:id/cancel', authenticate, cancelBloodRequest);

export default router;
