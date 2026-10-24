import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  profilePhoto: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  profilePhoto: z.string().optional(),
});

export const donorRegistrationSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  contactPreference: z.enum(['Phone', 'Email', 'Platform Only']).default('Platform Only'),
  isAvailable: z.boolean().default(true),
  lastDonationDate: z.string().optional(),
  profilePhoto: z.string().optional(),
  consentToContact: z.literal(true, {
    errorMap: () => ({ message: 'Explicit consent to receive donor contact requests is required' }),
  }),
});

export const updateDonorProfileSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  contactPreference: z.enum(['Phone', 'Email', 'Platform Only']).optional(),
  isAvailable: z.boolean().optional(),
  lastDonationDate: z.string().optional(),
  profilePhoto: z.string().optional(),
  status: z.enum(['Active', 'Paused', 'Withdrawn']).optional(),
});

export const bloodRequestSchema = z.object({
  patientName: z.string().min(2, 'Requester or patient reference is required').max(100),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsRequested: z.number().int().min(1, 'Must request at least 1 unit').max(50),
  hospital: z.string().min(2, 'Hospital/Facility name is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  requiredDate: z.string().min(1, 'Required date is required'),
  urgency: z.enum(['Normal', 'Urgent', 'Critical']).default('Normal'),
  preferredContact: z.enum(['Phone', 'Email', 'Platform']).default('Phone'),
  contactPhone: z.string().optional(),
  additionalInfo: z.string().max(1000).optional(),
  confirmationAccurate: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that the details provided are accurate' }),
  }),
});

export const updateBloodRequestSchema = z.object({
  status: z
    .enum(['Open', 'Contacting Donors', 'Partially Fulfilled', 'Fulfilled', 'Cancelled', 'Closed'])
    .optional(),
  unitsFulfilled: z.number().int().min(0).optional(),
  additionalInfo: z.string().max(1000).optional(),
  urgency: z.enum(['Normal', 'Urgent', 'Critical']).optional(),
  cancelledReason: z.string().max(500).optional(),
});

export const donorContactRequestSchema = z.object({
  bloodRequestId: z.string().min(1, 'Blood request ID is required'),
  donorId: z.string().min(1, 'Donor profile ID is required'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
});

export const respondDonorContactSchema = z.object({
  status: z.enum(['Accepted', 'Declined']),
  responseNote: z.string().max(500).optional(),
});

export const organDonationInterestSchema = z.object({
  consentToSave: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm consent. This is an expression of interest only, not legal donor consent.',
    }),
  }),
  requestMoreInfo: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const organAssistanceRequestSchema = z.object({
  requesterName: z.string().min(2, 'Full name is required').max(100),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(8, 'Phone number is required').max(20),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  assistanceType: z.enum([
    'General Guidance & Process Explanation',
    'Authorized Transplant Center Directory Navigation',
    'Official Government NOTTO/SOTTO Guidance',
    'Grievance & Resource Contact Assistance',
  ]),
  preferredContact: z.enum(['Phone', 'Email']).default('Email'),
  briefDescription: z
    .string()
    .min(10, 'Please provide at least a brief explanation')
    .max(1000, 'Description cannot exceed 1000 characters'),
  consentToProcess: z.literal(true, {
    errorMap: () => ({ message: 'Consent to process your assistance request is required' }),
  }),
});

export const updateOrganAssistanceStatusSchema = z.object({
  status: z.enum([
    'Submitted',
    'Under Review',
    'Information Required',
    'Referred to Resource',
    'Resolved',
    'Cancelled',
  ]),
  note: z.string().max(1000).optional(),
  referredResources: z.array(z.string()).optional(),
});

export const healthcareResourceSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum([
    'Government Transplant Authority',
    'Authorized Transplant Center',
    'Licensed Blood Center',
    'Cornea / Tissue Bank',
    'Support & Information Desk',
  ]),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  address: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  sourceReference: z.string().min(2),
  isOfficial: z.boolean().default(false),
  isVerified: z.boolean().default(true),
  notes: z.string().optional(),
});

export const contactMessageSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});
