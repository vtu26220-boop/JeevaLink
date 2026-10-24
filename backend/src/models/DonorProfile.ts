import mongoose, { Document, Schema } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ContactPreference = 'Phone' | 'Email' | 'Platform Only';
export type DonorStatus = 'Active' | 'Paused' | 'Withdrawn';

export interface IDonationRecord {
  date: Date;
  facility: string;
  units: number;
  notes?: string;
}

export interface IDonorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  contactPreference: ContactPreference;
  isAvailable: boolean;
  lastDonationDate?: Date;
  profilePhoto?: string;
  consentToContact: boolean;
  totalDonations: number;
  donationHistory: IDonationRecord[];
  status: DonorStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DonationRecordSchema = new Schema<IDonationRecord>(
  {
    date: { type: Date, required: true },
    facility: { type: String, required: true, trim: true },
    units: { type: Number, required: true, min: 1, default: 1 },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    contactPreference: {
      type: String,
      enum: ['Phone', 'Email', 'Platform Only'],
      default: 'Platform Only',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDonationDate: {
      type: Date,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    consentToContact: {
      type: Boolean,
      required: [true, 'Explicit consent to receive donor contact requests is required'],
      default: false,
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    donationHistory: [DonationRecordSchema],
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Withdrawn'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient donor discovery
DonorProfileSchema.index({ bloodGroup: 1, city: 1, isAvailable: 1, status: 1 });
DonorProfileSchema.index({ bloodGroup: 1, state: 1, isAvailable: 1, status: 1 });

export const DonorProfile = mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);
