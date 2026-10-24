import { Router } from 'express';
import {
  createAssistanceRequest,
  getMyAssistanceRequests,
  getAssistanceRequestById,
  cancelAssistanceRequest,
} from '../controllers/organAssistanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createAssistanceRequest);
router.get('/me', getMyAssistanceRequests);
router.get('/:id', getAssistanceRequestById);
router.post('/:id/cancel', cancelAssistanceRequest);

export default router;
