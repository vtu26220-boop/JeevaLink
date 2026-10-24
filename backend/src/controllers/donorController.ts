import { Request, Response, NextFunction } from 'express';
import { DonorProfile } from '../models/DonorProfile';
import { User } from '../models/User';
import { donorRegistrationSchema, updateDonorProfileSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

// Register or update current user as a donor
export const registerDonor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = donorRegistrationSchema.parse(req.body);

    let donorProfile = await DonorProfile.findOne({ user: req.user._id });

    if (donorProfile) {
      // Update existing donor profile
      donorProfile.bloodGroup = validatedData.bloodGroup;
      donorProfile.city = validatedData.city;
      donorProfile.state = validatedData.state;
      donorProfile.contactPreference = validatedData.contactPreference;
      donorProfile.isAvailable = validatedData.isAvailable;
      if (validatedData.lastDonationDate) {
        donorProfile.lastDonationDate = new Date(validatedData.lastDonationDate);
      }
      if (validatedData.profilePhoto) {
        donorProfile.profilePhoto = validatedData.profilePhoto;
      }
      donorProfile.consentToContact = validatedData.consentToContact;
      donorProfile.status = 'Active';
      await donorProfile.save();
    } else {
      // Create new donor profile
      donorProfile = await DonorProfile.create({
        user: req.user._id,
        name: req.user.name,
        bloodGroup: validatedData.bloodGroup,
        city: validatedData.city,
        state: validatedData.state,
        contactPreference: validatedData.contactPreference,
        isAvailable: validatedData.isAvailable,
        lastDonationDate: validatedData.lastDonationDate
          ? new Date(validatedData.lastDonationDate)
          : undefined,
        profilePhoto: validatedData.profilePhoto || req.user.profilePhoto || '',
        consentToContact: validatedData.consentToContact,
        status: 'Active',
      });
    }

    // Mark user as donor
    await User.findByIdAndUpdate(req.user._id, {
      isDonor: true,
      ...(req.user.role === 'user' ? { role: 'donor' } : {}),
    });

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'DONOR_PROFILE_SAVED',
      targetType: 'DonorProfile',
      targetId: donorProfile._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Donor profile saved successfully. Thank you for your commitment to saving lives!',
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Search / Discover donors (with privacy protection)
export const getDonors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bloodGroup, city, state, isAvailable, page = 1, limit = 12 } = req.query;

    const query: any = {
      status: 'Active',
      consentToContact: true,
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (city) {
      query.city = { $regex: new RegExp(String(city).trim(), 'i') };
    }
    if (state) {
      query.state = { $regex: new RegExp(String(state).trim(), 'i') };
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Project only safe fields (NEVER expose phone or email in public search)
    const [donors, total] = await Promise.all([
      DonorProfile.find(query)
        .select('_id name bloodGroup city state isAvailable lastDonationDate totalDonations contactPreference profilePhoto createdAt')
        .sort({ isAvailable: -1, updatedAt: -1 })
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

// Get current user's donor profile
export const getMyDonorProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const donorProfile = await DonorProfile.findOne({ user: req.user._id });

    if (!donorProfile) {
      res.status(404).json({
        success: false,
        message: 'Donor profile not found. Please register as a donor.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's donor profile
export const updateMyDonorProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = updateDonorProfileSchema.parse(req.body);

    const donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      res.status(404).json({ success: false, message: 'Donor profile not found' });
      return;
    }

    if (validatedData.bloodGroup) donorProfile.bloodGroup = validatedData.bloodGroup;
    if (validatedData.city) donorProfile.city = validatedData.city;
    if (validatedData.state) donorProfile.state = validatedData.state;
    if (validatedData.contactPreference) donorProfile.contactPreference = validatedData.contactPreference;
    if (validatedData.isAvailable !== undefined) donorProfile.isAvailable = validatedData.isAvailable;
    if (validatedData.lastDonationDate) {
      donorProfile.lastDonationDate = new Date(validatedData.lastDonationDate);
    }
    if (validatedData.profilePhoto !== undefined) donorProfile.profilePhoto = validatedData.profilePhoto;
    if (validatedData.status) donorProfile.status = validatedData.status;

    await donorProfile.save();

    res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully.',
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle donor availability status
export const toggleAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      res.status(404).json({ success: false, message: 'Donor profile not found' });
      return;
    }

    donorProfile.isAvailable = !donorProfile.isAvailable;
    await donorProfile.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to: ${donorProfile.isAvailable ? 'Available' : 'Unavailable'}`,
      isAvailable: donorProfile.isAvailable,
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Record a donation history item
export const addDonationRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { date, facility, units = 1, notes } = req.body;
    if (!date || !facility) {
      res.status(400).json({ success: false, message: 'Date and facility are required' });
      return;
    }

    const donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      res.status(404).json({ success: false, message: 'Donor profile not found' });
      return;
    }

    donorProfile.donationHistory.push({
      date: new Date(date),
      facility: String(facility).trim(),
      units: Number(units) || 1,
      notes: notes ? String(notes).trim() : undefined,
    });
    donorProfile.totalDonations += Number(units) || 1;
    donorProfile.lastDonationDate = new Date(date);

    await donorProfile.save();

    res.status(201).json({
      success: true,
      message: 'Donation record added successfully.',
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw donor listing
export const withdrawDonorListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      res.status(404).json({ success: false, message: 'Donor profile not found' });
      return;
    }

    donorProfile.status = 'Withdrawn';
    donorProfile.isAvailable = false;
    await donorProfile.save();

    await User.findByIdAndUpdate(req.user._id, { isDonor: false });

    res.status(200).json({
      success: true,
      message: 'Your donor profile has been withdrawn from public discovery.',
      donor: donorProfile,
    });
  } catch (error) {
    next(error);
  }
};
