
import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { User } from '../models/User';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/schemas';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

const googleClient = new OAuth2Client();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
      email: validatedData.email,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          'An account with this email address already exists. Please log in.',
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

    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to JeevaLink!',
      token,
      user: {
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
      },
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

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google Login
 * The frontend sends a Google ID token as { credential: "..." }.
 * The backend verifies the token before creating a JeevaLink session.
 */
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const credential: unknown = req.body?.credential;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      res.status(500).json({
        success: false,
        message: 'Google login is not configured on the server.',
      });
      return;
    }

    if (typeof credential !== 'string' || !credential.trim()) {
      res.status(400).json({
        success: false,
        message: 'Google credential is required.',
      });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      res.status(401).json({
        success: false,
        message: 'Unable to verify your Google account.',
      });
      return;
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Do not automatically link a Google account to an existing
        // password account. The user should authenticate with that
        // account first, then use a separately secured account-linking flow.
        res.status(409).json({
          success: false,
          message:
            'An account with this email already exists. Please log in using your existing method.',
        });
        return;
      }

      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        profilePhoto: payload.picture || '',
        phone: '',
        city: '',
        state: '',
        role: 'user',
        isDonor: false,
        isRequester: false,
        termsAccepted: false,
      });

      await AuditLog.create({
        actor: user._id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'USER_REGISTERED',
        targetType: 'User',
        targetId: user._id.toString(),
        ipAddress: req.ip,
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      token,
      user: {
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
      },
    });
  } catch (error) {
    // Invalid, expired, or incorrectly targeted Google tokens should
    // not result in an authenticated session.
    res.status(401).json({
      success: false,
      message: 'Google sign-in failed. Please try again.',
    });
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

    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
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
      },
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
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    if (validatedData.name) user.name = validatedData.name;
    if (validatedData.phone) user.phone = validatedData.phone;
    if (validatedData.city) user.city = validatedData.city;
    if (validatedData.state) user.state = validatedData.state;

    if (validatedData.profilePhoto !== undefined) {
      user.profilePhoto = validatedData.profilePhoto;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};
