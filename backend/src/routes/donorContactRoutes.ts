import { Router } from 'express';
import {
  createContactRequest,
  getMyIncomingRequests,
  getMyOutgoingRequests,
  respondContactRequest,
} from '../controllers/donorContactController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createContactRequest);
router.get('/incoming', getMyIncomingRequests);
router.get('/outgoing', getMyOutgoingRequests);
router.patch('/:id/respond', respondContactRequest);

export default router;
