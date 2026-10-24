import { User } from '../models/User';
import { HealthcareResource } from '../models/HealthcareResource';
import { ENV } from '../config/env';

export const INITIAL_VERIFIED_RESOURCES = [
  {
    name: 'National Organ and Tissue Transplant Organisation (NOTTO)',
    category: 'Government Transplant Authority' as const,
    city: 'New Delhi',
    state: 'Delhi',
    address: '4th & 5th Floor, Institute of Pathology Building, Safdarjung Hospital, New Delhi - 110029',
    specialties: ['National Organ Allocation', 'Donor Registry', 'Policy & Grievance Redressal'],
    contactPhone: '1800-11-4770',
    contactEmail: 'dir-notto@nic.in',
    websiteUrl: 'https://notto.mohfw.gov.in',
    sourceReference: 'Ministry of Health and Family Welfare, Government of India Official Directory',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Apex authority coordinating deceased organ procurement and allocation in India.',
  },
  {
    name: 'Regional Organ & Tissue Transplant Organisation (ROTTO North) - PGIMER',
    category: 'Government Transplant Authority' as const,
    city: 'Chandigarh',
    state: 'Chandigarh',
    address: 'Postgraduate Institute of Medical Education and Research, Sector 12, Chandigarh - 160012',
    specialties: ['Kidney Transplant', 'Liver Transplant', 'Cornea Bank', 'Regional Coordination'],
    contactPhone: '0172-2756184',
    contactEmail: 'rottonorth@pgimer.edu.in',
    websiteUrl: 'https://pgimer.edu.in',
    sourceReference: 'PGIMER Chandigarh & NOTTO Regional Directory',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Regional authority coordinating northern states: Punjab, Haryana, HP, J&K, Uttarakhand, Chandigarh.',
  },
  {
    name: 'Regional Organ & Tissue Transplant Organisation (ROTTO West) - KEM Hospital',
    category: 'Government Transplant Authority' as const,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Seth GS Medical College & KEM Hospital, Parel, Mumbai - 400012',
    specialties: ['Kidney Transplant', 'Liver Transplant', 'Heart Transplant', 'Regional Coordination'],
    contactPhone: '022-24107000',
    contactEmail: 'rottowest@kem.edu',
    websiteUrl: 'https://kem.edu',
    sourceReference: 'Maharashtra State Health Dept & NOTTO West Directory',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Regional coordination for Western Region including Maharashtra, Gujarat, and Goa.',
  },
  {
    name: 'TRANSTAN (Transplant Authority of Tamil Nadu / SOTTO)',
    category: 'Government Transplant Authority' as const,
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Government Multi Super Speciality Hospital, Omandurar Estate, Chennai - 600002',
    specialties: ['State Organ Registry', 'Heart & Lung Allocation', 'Kidney & Liver Waitlist'],
    contactPhone: '044-25333676',
    contactEmail: 'transtan.tn@gmail.com',
    websiteUrl: 'https://transtan.tn.gov.in',
    sourceReference: 'Government of Tamil Nadu Health & Family Welfare Department',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Pioneering state organ sharing network in South India with comprehensive registry.',
  },
  {
    name: 'All India Institute of Medical Sciences (AIIMS) - Apex Blood Bank',
    category: 'Licensed Blood Center' as const,
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Main Blood Bank, Ground Floor, AIIMS, Ansari Nagar, New Delhi - 110029',
    specialties: ['Whole Blood', 'Platelets (Single Donor Platelets)', 'Fresh Frozen Plasma', 'Cryoprecipitate'],
    contactPhone: '011-26593259',
    contactEmail: 'bloodbank@aiims.edu',
    websiteUrl: 'https://aiims.edu',
    sourceReference: 'AIIMS Transfusion Medicine Division & Central Drugs Standard Control Org',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: '24/7 Apex transfusion center providing certified blood components for urgent requirements.',
  },
  {
    name: 'Tata Memorial Hospital - Transfusion Medicine & Blood Bank',
    category: 'Licensed Blood Center' as const,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
    specialties: ['Apheretic Platelets', 'Leukodepleted Blood Components', 'Emergency Oncology Blood Supply'],
    contactPhone: '022-24177000',
    contactEmail: 'tmhbloodbank@tmc.gov.in',
    websiteUrl: 'https://tmc.gov.in',
    sourceReference: 'Department of Atomic Energy & TMC Transfusion Registry',
    isOfficial: true,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Specialized 24/7 blood and component separation center for oncology and critical care patients.',
  },
  {
    name: 'Narayana Health City - Institute of Cardiac Sciences & Organ Transplant',
    category: 'Authorized Transplant Center' as const,
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru - 560099',
    specialties: ['Heart Transplant', 'Kidney Transplant', 'Liver Transplant', 'Bone Marrow Transplant'],
    contactPhone: '080-71222222',
    contactEmail: 'info.healthcity@narayanahealth.org',
    websiteUrl: 'https://narayanahealth.org',
    sourceReference: 'Karnataka State Appropriate Authority for Organ Transplantation (Jeevasarthakathe)',
    isOfficial: false,
    isVerified: true,
    lastVerifiedDate: new Date(),
    notes: 'Authorized super-specialty transplant institution registered with Karnataka SOTTO.',
  },
];

export const seedInitialData = async (): Promise<void> => {
  try {
    // 1. Seed admin if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('🌱 Seeding initial administrator account...');
      await User.create({
        name: ENV.ADMIN_NAME,
        email: ENV.ADMIN_EMAIL,
        password: ENV.ADMIN_PASSWORD,
        phone: '+91 98765 43210',
        city: 'New Delhi',
        state: 'Delhi',
        role: 'admin',
        termsAccepted: true,
      });
      console.log(`✅ Default admin created: ${ENV.ADMIN_EMAIL} (Password configured in .env)`);
    }

    // 2. Seed verified healthcare resources if collection is empty
    const resourcesCount = await HealthcareResource.countDocuments();
    if (resourcesCount === 0) {
      console.log('🌱 Seeding verified healthcare & transplant resources directory...');
      await HealthcareResource.insertMany(INITIAL_VERIFIED_RESOURCES);
      console.log(`✅ Seeded ${INITIAL_VERIFIED_RESOURCES.length} verified healthcare resources.`);
    }
  } catch (error) {
    console.error('Error during initial data seeding:', error);
  }
};
