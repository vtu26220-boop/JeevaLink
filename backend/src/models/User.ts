
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'guest' | 'user' | 'donor' | 'requester' | 'admin';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  phone: string;
  city: string;
  state: string;
  profilePhoto?: string;
  role: UserRole;
  isDonor: boolean;
  isRequester: boolean;
  termsAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // Password is optional for Google-authenticated accounts.
    password: {
      type: String,
      required: false,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },

    // Google subject identifier, populated after server-side token verification.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    phone: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      required: false,
      trim: true,
      default: '',
      index: true,
    },

    state: {
      type: String,
      required: false,
      trim: true,
      default: '',
      index: true,
    },

    profilePhoto: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['guest', 'user', 'donor', 'requester', 'admin'],
      default: 'user',
      index: true,
    },

    isDonor: {
      type: Boolean,
      default: false,
      index: true,
    },

    isRequester: {
      type: Boolean,
      default: false,
      index: true,
    },

    termsAccepted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash passwords only when a password is provided or changed.
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Verify passwords for regular email/password login.
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
