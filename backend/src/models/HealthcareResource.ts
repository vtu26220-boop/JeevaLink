import mongoose, { Document, Schema } from 'mongoose';

export type ResourceCategory =
  | 'Government Transplant Authority'
  | 'Authorized Transplant Center'
  | 'Licensed Blood Center'
  | 'Cornea / Tissue Bank'
  | 'Support & Information Desk';

export interface IHealthcareResource extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: ResourceCategory;
  city: string;
  state: string;
  address?: string;
  specialties: string[];
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  sourceReference: string;
  isOfficial: boolean;
  isVerified: boolean;
  lastVerifiedDate: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthcareResourceSchema = new Schema<IHealthcareResource>(
  {
    name: {
      type: String,
      required: [true, 'Resource or institution name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: [
        'Government Transplant Authority',
        'Authorized Transplant Center',
        'Licensed Blood Center',
        'Cornea / Tissue Bank',
        'Support & Information Desk',
      ],
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
    address: {
      type: String,
      trim: true,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    contactPhone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    sourceReference: {
      type: String,
      required: [true, 'Official verification source reference is required'],
      trim: true,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastVerifiedDate: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

HealthcareResourceSchema.index({ category: 1, state: 1, city: 1, isVerified: 1 });

export const HealthcareResource = mongoose.model<IHealthcareResource>(
  'HealthcareResource',
  HealthcareResourceSchema
);
