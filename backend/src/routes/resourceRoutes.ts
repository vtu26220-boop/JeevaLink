import { Router } from 'express';
import { getResources, getResourceById } from '../controllers/resourceController';

const router = Router();

router.get('/', getResources);
router.get('/:id', getResourceById);

export default router;
