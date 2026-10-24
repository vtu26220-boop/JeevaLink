import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import donorRoutes from './donorRoutes';
import bloodRequestRoutes from './bloodRequestRoutes';
import donorContactRoutes from './donorContactRoutes';
import organDonationRoutes from './organDonationRoutes';
import organAssistanceRoutes from './organAssistanceRoutes';
import resourceRoutes from './resourceRoutes';
import notificationRoutes from './notificationRoutes';
import contactRoutes from './contactRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/blood-requests', bloodRequestRoutes);
router.use('/donor-contact-requests', donorContactRoutes);
router.use('/organ-donation', organDonationRoutes);
router.use('/organ-assistance-requests', organAssistanceRoutes);
router.use('/healthcare-resources', resourceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'JeevaLink API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
