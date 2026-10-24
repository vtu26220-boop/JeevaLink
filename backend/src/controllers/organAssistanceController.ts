import { Response, NextFunction } from 'express';
import { OrganAssistanceRequest } from '../models/OrganAssistanceRequest';
import { organAssistanceRequestSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

// Submit an assistance request
export const createAssistanceRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = organAssistanceRequestSchema.parse(req.body);

    const assistanceRequest = await OrganAssistanceRequest.create({
      user: req.user._id,
      requesterName: validatedData.requesterName,
      contactEmail: validatedData.contactEmail,
      contactPhone: validatedData.contactPhone,
      city: validatedData.city,
      state: validatedData.state,
      assistanceType: validatedData.assistanceType,
      preferredContact: validatedData.preferredContact,
      briefDescription: validatedData.briefDescription,
      consentToProcess: validatedData.consentToProcess,
      status: 'Submitted',
    });

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'ORGAN_ASSISTANCE_REQUESTED',
      targetType: 'OrganAssistanceRequest',
      targetId: assistanceRequest._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message:
        'Your assistance request has been submitted. Our support team will review and provide verified guidance.',
      assistanceRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's assistance requests
export const getMyAssistanceRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const requests = await OrganAssistanceRequest.find({ user: req.user._id })
      .populate('referredResources', 'name category city state websiteUrl contactPhone')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// Get single assistance request details (caller must be owner or admin)
export const getAssistanceRequestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const request = await OrganAssistanceRequest.findById(id).populate(
      'referredResources',
      'name category city state websiteUrl contactPhone'
    );

    if (!request) {
      res.status(404).json({ success: false, message: 'Assistance request not found' });
      return;
    }

    const isOwner = request.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this assistance request.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an assistance request (by requester)
export const cancelAssistanceRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const request = await OrganAssistanceRequest.findById(id);

    if (!request) {
      res.status(404).json({ success: false, message: 'Assistance request not found' });
      return;
    }

    const isOwner = request.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel this assistance request.',
      });
      return;
    }

    if (request.status === 'Resolved' || request.status === 'Cancelled') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status}.`,
      });
      return;
    }

    request.status = 'Cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Assistance request has been cancelled.',
      request,
    });
  } catch (error) {
    next(error);
  }
};
