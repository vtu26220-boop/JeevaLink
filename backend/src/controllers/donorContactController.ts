import { Response, NextFunction } from 'express';
import { DonorContactRequest } from '../models/DonorContactRequest';
import { DonorProfile } from '../models/DonorProfile';
import { BloodRequest } from '../models/BloodRequest';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { donorContactRequestSchema, respondDonorContactSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

// Create a new contact request from requester to donor
export const createContactRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { bloodRequestId, donorId, message } = donorContactRequestSchema.parse(req.body);

    // Verify blood request exists and belongs to requester
    const bloodRequest = await BloodRequest.findById(bloodRequestId);
    if (!bloodRequest) {
      res.status(404).json({ success: false, message: 'Blood request not found' });
      return;
    }

    if (bloodRequest.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only contact donors for your own blood requests.',
      });
      return;
    }

    // Verify donor exists and has consented to receive contact requests
    const donorProfile = await DonorProfile.findById(donorId).populate('user');
    if (!donorProfile) {
      res.status(404).json({ success: false, message: 'Donor profile not found' });
      return;
    }

    if (!donorProfile.consentToContact) {
      res.status(400).json({
        success: false,
        message: 'This donor has not provided consent to receive contact requests.',
      });
      return;
    }

    // Check for existing request between this blood request and donor
    const existing = await DonorContactRequest.findOne({
      bloodRequest: bloodRequestId,
      donor: donorId,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `A contact request for this donor already exists with status "${existing.status}".`,
      });
      return;
    }

    // Create contact request
    const contactRequest = await DonorContactRequest.create({
      bloodRequest: bloodRequestId,
      requester: req.user._id,
      donor: donorId,
      donorUser: donorProfile.user._id,
      message,
      status: 'Pending',
    });

    // Update BloodRequest status to 'Contacting Donors' if currently 'Open'
    if (bloodRequest.status === 'Open') {
      bloodRequest.status = 'Contacting Donors';
      await bloodRequest.save();
    }

    // Send in-app notification to the donor
    await Notification.create({
      recipient: donorProfile.user._id,
      title: 'New Blood Donation Contact Request',
      message: `${req.user.name} is seeking blood assistance for ${bloodRequest.bloodGroup} at ${bloodRequest.hospital}, ${bloodRequest.city}. Please review and respond.`,
      type: 'contact_request',
      linkUrl: '/services/blood-donation',
    });

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'DONOR_CONTACT_REQUEST_SENT',
      targetType: 'DonorContactRequest',
      targetId: contactRequest._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Contact request sent to donor. You will be notified when they respond.',
      contactRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get requests sent to the logged-in donor
export const getMyIncomingRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const requests = await DonorContactRequest.find({ donorUser: req.user._id })
      .populate('bloodRequest')
      .populate('requester', 'name phone email city state')
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

// Get requests sent by the logged-in requester
export const getMyOutgoingRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const requests = await DonorContactRequest.find({ requester: req.user._id })
      .populate('bloodRequest', 'patientName bloodGroup hospital city status urgency')
      .populate('donor', 'name bloodGroup city state')
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

// Donor responds to contact request (Accept or Decline)
export const respondContactRequest = async (
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
    const { status, responseNote } = respondDonorContactSchema.parse(req.body);

    const contactRequest = await DonorContactRequest.findById(id).populate('bloodRequest');

    if (!contactRequest) {
      res.status(404).json({ success: false, message: 'Contact request not found' });
      return;
    }

    // Only donor user or admin can respond
    if (contactRequest.donorUser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to respond to this request.',
      });
      return;
    }

    contactRequest.status = status;
    contactRequest.responseNote = responseNote;
    contactRequest.respondedAt = new Date();

    // If accepted, share donor contact details with requester
    if (status === 'Accepted') {
      const donorUser = await User.findById(contactRequest.donorUser);
      contactRequest.sharedContactDetails = {
        donorName: donorUser?.name || req.user.name,
        donorPhone: donorUser?.phone || req.user.phone,
        donorEmail: donorUser?.email || req.user.email,
      };

      // Notify requester
      await Notification.create({
        recipient: contactRequest.requester,
        title: 'Donor Accepted Your Contact Request!',
        message: `${req.user.name} has accepted your contact request! Contact details are now available in your Blood Requirement dashboard.`,
        type: 'contact_response',
        linkUrl: '/services/blood-requirement',
      });
    } else {
      // Notify requester of decline
      await Notification.create({
        recipient: contactRequest.requester,
        title: 'Donor Declined Contact Request',
        message: `A donor was unable to accept your blood request at this time. You can search for other matching donors on JeevaLink.`,
        type: 'contact_response',
        linkUrl: '/services/blood-requirement',
      });
    }

    await contactRequest.save();

    res.status(200).json({
      success: true,
      message: `Contact request ${status.toLowerCase()} successfully.`,
      contactRequest,
    });
  } catch (error) {
    next(error);
  }
};
