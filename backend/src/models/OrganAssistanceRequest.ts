import mongoose, { Document, Schema } from 'mongoose';

export type AssistanceStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Information Required'
  | 'Referred to Resource'
  | 'Resolved'
  | 'Cancelled';

export interface IAdminAssistanceNote {
  note: string;
  addedBy: mongoose.Types.ObjectId;
  addedByName: string;
  createdAt: Date;
}

export interface IOrganAssistanceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  requesterName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  assistanceType: string;
  preferredContact: 'Phone' | 'Email';
  briefDescription: string;
  consentToProcess: boolean;
  status: AssistanceStatus;
  adminNotes: IAdminAssistanceNote[];
  referredResources: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminAssistanceNoteSchema = new Schema<IAdminAssistanceNote>(
  {
    note: { type: String, required: true, trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addedByName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const OrganAssistanceRequestSchema = new Schema<IOrganAssistanceRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
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
    assistanceType: {
      type: String,
      required: [true, 'Type of assistance is required'],
      enum: [
        'General Guidance & Process Explanation',
        'Authorized Transplant Center Directory Navigation',
        'Official Government NOTTO/SOTTO Guidance',
        'Grievance & Resource Contact Assistance',
      ],
    },
    preferredContact: {
      type: String,
      enum: ['Phone', 'Email'],
      default: 'Email',
    },
    briefDescription: {
      type: String,
      required: [true, 'Brief non-clinical description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    consentToProcess: {
      type: Boolean,
      required: [true, 'Consent to process request is required'],
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Information Required',
        'Referred to Resource',
        'Resolved',
        'Cancelled',
      ],
      default: 'Submitted',
      index: true,
    },
    adminNotes: [AdminAssistanceNoteSchema],
    referredResources: [
      {
        type: Schema.Types.ObjectId,
        ref: 'HealthcareResource',
      },
    ],
  },
  {
    timestamps: true,
  }
);

OrganAssistanceRequestSchema.index({ user: 1, status: 1 });
OrganAssistanceRequestSchema.index({ status: 1, createdAt: -1 });

export const OrganAssistanceRequest = mongoose.model<IOrganAssistanceRequest>(
  'OrganAssistanceRequest',
  OrganAssistanceRequestSchema
);
