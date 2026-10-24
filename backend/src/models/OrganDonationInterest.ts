import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganDonationInterest extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  consentToSave: boolean;
  requestMoreInfo: boolean;
  notes?: string;
  isWithdrawn: boolean;
  withdrawnAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganDonationInterestSchema = new Schema<IOrganDonationInterest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    consentToSave: {
      type: Boolean,
      required: [
        true,
        'Explicit consent is required. Note: This is an internal expression of interest and NOT a legal organ donor registration.',
      ],
    },
    requestMoreInfo: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
      index: true,
    },
    withdrawnAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OrganDonationInterest = mongoose.model<IOrganDonationInterest>(
  'OrganDonationInterest',
  OrganDonationInterestSchema
);
