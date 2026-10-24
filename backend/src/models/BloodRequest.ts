import mongoose, { Document, Schema } from 'mongoose';
import { BloodGroup } from './DonorProfile';

export type BloodRequestUrgency = 'Normal' | 'Urgent' | 'Critical';
export type BloodRequestStatus =
  | 'Open'
  | 'Contacting Donors'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Cancelled'
  | 'Closed';

export interface IBloodRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  unitsFulfilled: number;
  hospital: string;
  city: string;
  state: string;
  requiredDate: Date;
  urgency: BloodRequestUrgency;
  preferredContact: 'Phone' | 'Email' | 'Platform';
  contactPhone?: string;
  additionalInfo?: string;
  confirmationAccurate: boolean;
  status: BloodRequestStatus;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Requester/Patient reference is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Required blood group is required'],
      index: true,
    },
    unitsRequested: {
      type: Number,
      required: [true, 'Number of units requested is required'],
      min: [1, 'Must request at least 1 unit'],
      max: [50, 'Units requested cannot exceed 50'],
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital or healthcare facility name is required'],
      trim: true,
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
    requiredDate: {
      type: Date,
      required: [true, 'Required date is required'],
    },
    urgency: {
      type: String,
      enum: ['Normal', 'Urgent', 'Critical'],
      default: 'Normal',
      index: true,
    },
    preferredContact: {
      type: String,
      enum: ['Phone', 'Email', 'Platform'],
      default: 'Phone',
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional information cannot exceed 1000 characters'],
    },
    confirmationAccurate: {
      type: Boolean,
      required: [true, 'Confirmation that details are accurate is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'Contacting Donors', 'Partially Fulfilled', 'Fulfilled', 'Cancelled', 'Closed'],
      default: 'Open',
      index: true,
    },
    cancelledReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and dashboard queries
BloodRequestSchema.index({ status: 1, bloodGroup: 1, city: 1 });
BloodRequestSchema.index({ requester: 1, status: 1 });

export const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
