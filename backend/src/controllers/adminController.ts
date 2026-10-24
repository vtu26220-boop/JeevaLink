import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { BloodRequest } from '../models/BloodRequest';
import { OrganAssistanceRequest } from '../models/OrganAssistanceRequest';
import { HealthcareResource } from '../models/HealthcareResource';
import { ContactMessage } from '../models/ContactMessage';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import {
  updateOrganAssistanceStatusSchema,
  healthcareResourceSchema,
} from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';

// 1. Dashboard statistics (all calculated from real database records)
export const getAdminDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalDonors,
      availableDonors,
      openBloodRequests,
      fulfilledBloodRequests,
      pendingAssistanceRequests,
      totalAssistanceRequests,
      unreadContactMessages,
    ] = await Promise.all([
      User.countDocuments(),
      DonorProfile.countDocuments({ status: 'Active' }),
      DonorProfile.countDocuments({ status: 'Active', isAvailable: true }),
      BloodRequest.countDocuments({ status: { $in: ['Open', 'Contacting Donors'] } }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      OrganAssistanceRequest.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
      OrganAssistanceRequest.countDocuments(),
      ContactMessage.countDocuments({ status: 'New' }),
    ]);

    // Blood groups breakdown
    const bloodGroupStats = await DonorProfile.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    // Request status breakdown
    const requestStatusStats = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        availableDonors,
        openBloodRequests,
        fulfilledBloodRequests,
        pendingAssistanceRequests,
        totalAssistanceRequests,
        unreadContactMessages,
      },
      bloodGroupStats,
      requestStatusStats,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Manage Users
export const getAdminUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: new RegExp(s, 'i') } },
        { email: { $regex: new RegExp(s, 'i') } },
        { city: { $regex: new RegExp(s, 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'donor', 'requester', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      actor: req.user!._id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_USER_ROLE_CHANGED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { oldRole, newRole: role },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Manage Donors (Admin view)
export const getAdminDonors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bloodGroup, status, city, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;
    if (city) query.city = { $regex: new RegExp(String(city).trim(), 'i') };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [donors, total] = await Promise.all([
      DonorProfile.find(query)
        .populate('user', 'email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DonorProfile.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      donors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Manage Blood Requests (Admin view)
export const getAdminBloodRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, urgency, bloodGroup, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BloodRequest.find(query)
        .populate('requester', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BloodRequest.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Manage Organ Assistance Requests
export const getAdminAssistanceRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      OrganAssistanceRequest.find(query)
        .populate('user', 'name email phone')
        .populate('referredResources', 'name category city state websiteUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      OrganAssistanceRequest.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminAssistanceRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, referredResources } = updateOrganAssistanceStatusSchema.parse(req.body);

    const request = await OrganAssistanceRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Assistance request not found' });
      return;
    }

    const oldStatus = request.status;
    request.status = status;

    if (note) {
      request.adminNotes.push({
        note,
        addedBy: req.user!._id,
        addedByName: req.user!.name,
        createdAt: new Date(),
      });
    }

    if (referredResources) {
      request.referredResources = referredResources as any;
    }

    await request.save();

    // Notify user of update
    await Notification.create({
      recipient: request.user,
      title: 'Organ Assistance Request Update',
      message: `Your assistance request status has been updated to "${status}". ${note ? `Support note: ${note}` : ''}`,
      type: 'assistance_status',
      linkUrl: '/services/organ-requirement',
    });

    await AuditLog.create({
      actor: req.user!._id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_ASSISTANCE_REQUEST_UPDATED',
      targetType: 'OrganAssistanceRequest',
      targetId: request._id.toString(),
      details: { oldStatus, newStatus: status, noteAdded: !!note },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Assistance request updated successfully.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Manage Healthcare Resources
export const createResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = healthcareResourceSchema.parse(req.body);

    const resource = await HealthcareResource.create({
      ...validatedData,
      verifiedBy: req.user!._id,
      lastVerifiedDate: new Date(),
    });

    await AuditLog.create({
      actor: req.user!._id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_RESOURCE_CREATED',
      targetType: 'HealthcareResource',
      targetId: resource._id.toString(),
      details: { name: resource.name, category: resource.category },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Verified healthcare resource created successfully.',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = healthcareResourceSchema.partial().parse(req.body);

    const resource = await HealthcareResource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    Object.assign(resource, validatedData);
    resource.lastVerifiedDate = new Date();
    resource.verifiedBy = req.user!._id;
    await resource.save();

    await AuditLog.create({
      actor: req.user!._id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_RESOURCE_UPDATED',
      targetType: 'HealthcareResource',
      targetId: resource._id.toString(),
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Healthcare resource updated successfully.',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await HealthcareResource.findByIdAndDelete(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    await AuditLog.create({
      actor: req.user!._id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_RESOURCE_DELETED',
      targetType: 'HealthcareResource',
      targetId: id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Healthcare resource deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// 7. Manage Contact Messages
export const getAdminContactMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ContactMessage.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactMessageStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      res.status(404).json({ success: false, message: 'Contact message not found' });
      return;
    }

    if (status) message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes;
    if (status === 'Replied') message.repliedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Contact message updated successfully.',
      contactMessage: message,
    });
  } catch (error) {
    next(error);
  }
};

// 8. View Audit Logs
export const getAdminAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { action, targetType, page = 1, limit = 30 } = req.query;
    const query: any = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
