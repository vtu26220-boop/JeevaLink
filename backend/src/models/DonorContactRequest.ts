import mongoose, { Document, Schema } from 'mongoose';

export type ContactRequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';

export interface IDonorContactRequest extends Document {
  _id: mongoose.Types.ObjectId;
  bloodRequest: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  donor: mongoose.Types.ObjectId;
  donorUser: mongoose.Types.ObjectId;
  message?: string;
  status: ContactRequestStatus;
  responseNote?: string;
  respondedAt?: Date;
  sharedContactDetails?: {
    donorName?: string;
    donorPhone?: string;
    donorEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DonorContactRequestSchema = new Schema<IDonorContactRequest>(
  {
    bloodRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
      index: true,
    },
    donorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    responseNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Response note cannot exceed 500 characters'],
    },
    respondedAt: {
      type: Date,
    },
    sharedContactDetails: {
      donorName: String,
      donorPhone: String,
      donorEmail: String,
    },
  },
  {
    timestamps: true,
  }
);

DonorContactRequestSchema.index({ bloodRequest: 1, donor: 1 }, { unique: true });

export const DonorContactRequest = mongoose.model<IDonorContactRequest>(
  'DonorContactRequest',
  DonorContactRequestSchema
);
