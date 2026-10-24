export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserRole = 'guest' | 'user' | 'donor' | 'requester' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profilePhoto?: string;
  role: UserRole;
  isDonor: boolean;
  isRequester: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DonorProfile {
  _id: string;
  user: string | { _id: string; name: string; email?: string; phone?: string };
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  contactPreference: 'Phone' | 'Email' | 'Platform Only';
  isAvailable: boolean;
  lastDonationDate?: string;
  profilePhoto?: string;
  consentToContact: boolean;
  totalDonations: number;
  donationHistory?: Array<{
    _id: string;
    date: string;
    facility: string;
    units: number;
    notes?: string;
  }>;
  status: 'Active' | 'Paused' | 'Withdrawn';
  createdAt: string;
}

export type BloodRequestUrgency = 'Normal' | 'Urgent' | 'Critical';
export type BloodRequestStatus =
  | 'Open'
  | 'Contacting Donors'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Cancelled'
  | 'Closed';

export interface BloodRequest {
  _id: string;
  requester: string | { _id: string; name: string; city?: string; state?: string; phone?: string; email?: string };
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  unitsFulfilled: number;
  hospital: string;
  city: string;
  state: string;
  requiredDate: string;
  urgency: BloodRequestUrgency;
  preferredContact: 'Phone' | 'Email' | 'Platform';
  contactPhone?: string;
  additionalInfo?: string;
  status: BloodRequestStatus;
  cancelledReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DonorContactRequest {
  _id: string;
  bloodRequest: string | BloodRequest;
  requester: string | User;
  donor: string | DonorProfile;
  donorUser: string | User;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';
  responseNote?: string;
  respondedAt?: string;
  sharedContactDetails?: {
    donorName?: string;
    donorPhone?: string;
    donorEmail?: string;
  };
  createdAt: string;
}

export interface OrganDonationInterest {
  _id: string;
  user: string;
  consentToSave: boolean;
  requestMoreInfo: boolean;
  notes?: string;
  isWithdrawn: boolean;
  submittedAt: string;
}

export type AssistanceStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Information Required'
  | 'Referred to Resource'
  | 'Resolved'
  | 'Cancelled';

export interface OrganAssistanceRequest {
  _id: string;
  user: string | { _id: string; name: string; email: string; phone: string };
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
  adminNotes: Array<{
    _id: string;
    note: string;
    addedByName: string;
    createdAt: string;
  }>;
  referredResources?: HealthcareResource[];
  createdAt: string;
  updatedAt?: string;
}

export type ResourceCategory =
  | 'Government Transplant Authority'
  | 'Authorized Transplant Center'
  | 'Licensed Blood Center'
  | 'Cornea / Tissue Bank'
  | 'Support & Information Desk';

export interface HealthcareResource {
  _id: string;
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
  lastVerifiedDate: string;
  notes?: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'Under Review' | 'Replied' | 'Closed';
  adminNotes?: string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  actor: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}
