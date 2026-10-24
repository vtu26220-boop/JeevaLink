import { Request, Response, NextFunction } from 'express';
import { BloodRequest, BloodRequestStatus } from '../models/BloodRequest';
import { User } from '../models/User';
import { bloodRequestSchema, updateBloodRequestSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

const ALLOWED_TRANSITIONS: Record<BloodRequestStatus, BloodRequestStatus[]> = {
  Open: ['Contacting Donors', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'],
  'Contacting Donors': ['Open', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'],
  'Partially Fulfilled': ['Fulfilled', 'Cancelled', 'Closed'],
  Fulfilled: ['Closed'],
  Cancelled: ['Closed'],
  Closed: [],
};

// Create a new blood request
export const createBloodRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = bloodRequestSchema.parse(req.body);

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      patientName: validatedData.patientName,
      bloodGroup: validatedData.bloodGroup,
      unitsRequested: validatedData.unitsRequested,
      unitsFulfilled: 0,
      hospital: validatedData.hospital,
      city: validatedData.city,
      state: validatedData.state,
      requiredDate: new Date(validatedData.requiredDate),
      urgency: validatedData.urgency,
      preferredContact: validatedData.preferredContact,
      contactPhone: validatedData.contactPhone || req.user.phone,
      additionalInfo: validatedData.additionalInfo,
      confirmationAccurate: validatedData.confirmationAccurate,
      status: 'Open',
    });

    // Mark user as requester
    await User.findByIdAndUpdate(req.user._id, {
      isRequester: true,
      ...(req.user.role === 'user' ? { role: 'requester' } : {}),
    });

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'BLOOD_REQUEST_CREATED',
      targetType: 'BloodRequest',
      targetId: bloodRequest._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Blood request published successfully. You can now connect with potential donors.',
      bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get public / filtered blood requests
export const getBloodRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bloodGroup, city, state, urgency, status, page = 1, limit = 10 } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      // By default show active requests
      query.status = { $in: ['Open', 'Contacting Donors', 'Partially Fulfilled'] };
    }

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = { $regex: new RegExp(String(city).trim(), 'i') };
    if (state) query.state = { $regex: new RegExp(String(state).trim(), 'i') };
    if (urgency) query.urgency = urgency;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BloodRequest.find(query)
        .populate('requester', 'name city state')
        .sort({ urgency: -1, createdAt: -1 })
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

// Get single blood request details
export const getBloodRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id).populate('requester', 'name city state');

    if (!request) {
      res.status(404).json({ success: false, message: 'Blood request not found' });
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

// Get current user's blood requests with dashboard stats
export const getMyBloodRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const requests = await BloodRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate real stats
    const stats = {
      total: requests.length,
      open: requests.filter((r) => r.status === 'Open').length,
      contactingDonors: requests.filter((r) => r.status === 'Contacting Donors').length,
      partiallyFulfilled: requests.filter((r) => r.status === 'Partially Fulfilled').length,
      fulfilled: requests.filter((r) => r.status === 'Fulfilled').length,
      cancelled: requests.filter((r) => r.status === 'Cancelled').length,
      closed: requests.filter((r) => r.status === 'Closed').length,
    };

    res.status(200).json({
      success: true,
      requests,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Update a blood request (status, units, notes)
export const updateBloodRequest = async (
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
    const bloodRequest = await BloodRequest.findById(id);

    if (!bloodRequest) {
      res.status(404).json({ success: false, message: 'Blood request not found' });
      return;
    }

    // Authorization check: only owner or admin can update
    const isOwner = bloodRequest.requester.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to update this blood request.',
      });
      return;
    }

    const validatedData = updateBloodRequestSchema.parse(req.body);

    // Validate status transition if status is being changed
    if (validatedData.status && validatedData.status !== bloodRequest.status) {
      const allowed = ALLOWED_TRANSITIONS[bloodRequest.status] || [];
      if (!isAdmin && !allowed.includes(validatedData.status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status transition from "${bloodRequest.status}" to "${validatedData.status}".`,
        });
        return;
      }
      bloodRequest.status = validatedData.status;
    }

    if (validatedData.unitsFulfilled !== undefined) {
      bloodRequest.unitsFulfilled = validatedData.unitsFulfilled;
      if (bloodRequest.unitsFulfilled >= bloodRequest.unitsRequested && bloodRequest.status !== 'Closed') {
        bloodRequest.status = 'Fulfilled';
      }
    }

    if (validatedData.additionalInfo !== undefined) {
      bloodRequest.additionalInfo = validatedData.additionalInfo;
    }

    if (validatedData.urgency) {
      bloodRequest.urgency = validatedData.urgency;
    }

    if (validatedData.cancelledReason) {
      bloodRequest.cancelledReason = validatedData.cancelledReason;
    }

    await bloodRequest.save();

    res.status(200).json({
      success: true,
      message: 'Blood request updated successfully.',
      bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a blood request
export const cancelBloodRequest = async (
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
    const { reason } = req.body;

    const bloodRequest = await BloodRequest.findById(id);
    if (!bloodRequest) {
      res.status(404).json({ success: false, message: 'Blood request not found' });
      return;
    }

    const isOwner = bloodRequest.requester.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel this blood request.',
      });
      return;
    }

    if (bloodRequest.status === 'Closed' || bloodRequest.status === 'Fulfilled') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a blood request that is already ${bloodRequest.status}.`,
      });
      return;
    }

    bloodRequest.status = 'Cancelled';
    bloodRequest.cancelledReason = reason || 'Cancelled by requester';
    await bloodRequest.save();

    res.status(200).json({
      success: true,
      message: 'Blood request has been cancelled.',
      bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};
