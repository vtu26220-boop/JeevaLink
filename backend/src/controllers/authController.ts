import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phone,
      city: validatedData.city,
      state: validatedData.state,
      profilePhoto: validatedData.profilePhoto || '',
      role: 'user',
      termsAccepted: validatedData.termsAccepted,
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    // Record audit log
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      ipAddress: req.ip,
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      profilePhoto: user.profilePhoto,
      role: user.role,
      isDonor: user.isDonor,
      isRequester: user.isRequester,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to JeevaLink!',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      profilePhoto: user.profilePhoto,
      role: user.role,
      isDonor: user.isDonor,
      isRequester: user.isRequester,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const safeUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      city: req.user.city,
      state: req.user.state,
      profilePhoto: req.user.profilePhoto,
      role: req.user.role,
      isDonor: req.user.isDonor,
      isRequester: req.user.isRequester,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.phone) user.phone = validatedData.phone;
    if (validatedData.city) user.city = validatedData.city;
    if (validatedData.state) user.state = validatedData.state;
    if (validatedData.profilePhoto !== undefined) user.profilePhoto = validatedData.profilePhoto;

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      profilePhoto: user.profilePhoto,
      role: user.role,
      isDonor: user.isDonor,
      isRequester: user.isRequester,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};
