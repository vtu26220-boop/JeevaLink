import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserRole,
  getAdminDonors,
  getAdminBloodRequests,
  getAdminAssistanceRequests,
  updateAdminAssistanceRequest,
  createResource,
  updateResource,
  deleteResource,
  getAdminContactMessages,
  updateContactMessageStatus,
  getAdminAuditLogs,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Protect ALL admin routes
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/donors', getAdminDonors);
router.get('/blood-requests', getAdminBloodRequests);
router.get('/organ-assistance-requests', getAdminAssistanceRequests);
router.patch('/organ-assistance-requests/:id', updateAdminAssistanceRequest);
router.post('/resources', createResource);
router.patch('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);
router.get('/contact-messages', getAdminContactMessages);
router.patch('/contact-messages/:id', updateContactMessageStatus);
router.get('/audit-logs', getAdminAuditLogs);

export default router;
