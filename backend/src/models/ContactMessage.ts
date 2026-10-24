import mongoose, { Document, Schema } from 'mongoose';

export type ContactMessageStatus = 'New' | 'Under Review' | 'Replied' | 'Closed';

export interface IContactMessage extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  adminNotes?: string;
  repliedAt?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['New', 'Under Review', 'Replied', 'Closed'],
      default: 'New',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });

export const ContactMessage = mongoose.model<IContactMessage>(
  'ContactMessage',
  ContactMessageSchema
);
