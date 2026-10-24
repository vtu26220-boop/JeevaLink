import { Request, Response, NextFunction } from 'express';
import { OrganDonationInterest } from '../models/OrganDonationInterest';
import { organDonationInterestSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

// Verified official external registration resources (India)
const OFFICIAL_ORGAN_RESOURCES = [
  {
    id: 'notto',
    name: 'NOTTO (National Organ and Tissue Transplant Organisation)',
    authority: 'Directorate General of Health Services, Ministry of Health and Family Welfare, Govt. of India',
    purpose: 'Apex national organization for coordinating organ procurement, registry, and pledge in India.',
    websiteUrl: 'https://notto.mohfw.gov.in',
    isOfficialRegistry: true,
    guidance: 'To legally pledge organs and receive an official National Donor Card, complete the online pledge form on the official NOTTO portal.',
    helpline: '1800-11-4770 (Toll Free National Organ Donation Helpline)',
  },
  {
    id: 'rotto-north',
    name: 'ROTTO (Regional Organ & Tissue Transplant Organisation)',
    authority: 'Regional government transplant authorities (North, South, East, West, North-East)',
    purpose: 'Regional coordination between State and National registries for organ procurement and allocation.',
    websiteUrl: 'https://notto.mohfw.gov.in',
    isOfficialRegistry: true,
    guidance: 'State and regional hospital coordinators verify patient waitlists and deceased donor family consents.',
    helpline: 'Available through respective regional medical institutes (e.g., PGIMER Chandigarh, AIIMS Delhi, KEM Mumbai)',
  },
  {
    id: 'sotto-state',
    name: 'SOTTO (State Organ & Tissue Transplant Organisations)',
    authority: 'State Health Departments across Indian states (e.g., Jeevandan AP/Telangana, Transtan Tamil Nadu, ZTCC Maharashtra)',
    purpose: 'State-level registry management, waiting list management, and hospital networking for organ donation.',
    websiteUrl: 'https://notto.mohfw.gov.in',
    isOfficialRegistry: true,
    guidance: 'For state-specific donor cards and waitlist queries, consult your respective State Health Department or SOTTO center.',
    helpline: 'Varies by state',
  },
];

// Organ donation educational FAQs
const ORGAN_DONATION_FAQS = [
  {
    id: 'faq-1',
    category: 'General Concepts',
    question: 'What is organ donation and who can be a donor?',
    answer:
      'Organ donation is the process of surgically removing an organ or tissue from one person (the donor) and transplanting it into another person (the recipient). Almost anyone can express their wish to donate organs. Age or past medical history does not automatically exclude someone; specialized transplant doctors evaluate clinical suitability at the time of potential donation.',
  },
  {
    id: 'faq-2',
    category: 'Living vs Deceased Donation',
    question: 'What is the difference between living donation and deceased donation?',
    answer:
      'A living donor is a healthy person who donates one kidney, a portion of the liver, or bone marrow to a recipient (regulated strictly by the Transplantation of Human Organs and Tissues Act to prevent commercial dealing). A deceased donor is an individual who has been declared brain-stem dead in an ICU by a board of certified doctors, where heart, lungs, kidneys, liver, pancreas, and tissues (corneas, skin, bone) can be donated with family consent.',
  },
  {
    id: 'faq-3',
    category: 'Legal Registration',
    question: 'Does pledging on JeevaLink count as a legal donor registry?',
    answer:
      'No. JeevaLink provides educational assistance and a community expression of interest only. To officially pledge your organs and obtain a Government Donor Card in India, you must register directly with NOTTO (National Organ and Tissue Transplant Organisation) at notto.mohfw.gov.in. Even with a donor card, informing your family is vital because next-of-kin legal consent is mandatory under Indian law.',
  },
  {
    id: 'faq-4',
    category: 'Family Consent',
    question: 'Why is it important to discuss organ donation with my family?',
    answer:
      'Under the Transplantation of Human Organs Act, the legal next-of-kin must provide written consent before organs can be retrieved after brain-stem death. By discussing your wishes openly with your family today, they will have clarity and comfort honoring your decision during a difficult moment.',
  },
  {
    id: 'faq-5',
    category: 'Myths & Facts',
    question: 'Will doctors try less hard to save my life if I have pledged to be a donor?',
    answer:
      'Myth. The medical team treating you in an emergency has the sole ethical and legal objective of saving your life. Organ donation is only considered after all life-saving efforts have failed and brain-stem death is certified by an independent panel of four doctors who have no connection to the transplant team.',
  },
  {
    id: 'faq-6',
    category: 'Religion and Ethics',
    question: 'Do major religions support organ donation?',
    answer:
      'All major world religions—including Hinduism, Islam, Christianity, Sikhism, Buddhism, and Jainism—support organ and tissue donation as a profound act of charity, compassion, and selfless giving that saves human life.',
  },
];

// Get official external registration resources
export const getOfficialResources = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    resources: OFFICIAL_ORGAN_RESOURCES,
    disclaimer:
      'JeevaLink is an independent educational platform. JeevaLink does NOT determine medical eligibility, allocate organs, maintain waiting lists, or replace official healthcare and government systems.',
  });
};

// Get organ donation educational FAQs
export const getOrganDonationFAQs = (req: Request, res: Response): void => {
  const { query } = req.query;

  let faqs = ORGAN_DONATION_FAQS;
  if (query) {
    const q = String(query).toLowerCase().trim();
    faqs = faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  res.status(200).json({
    success: true,
    faqs,
  });
};

// Submit JeevaLink expression of interest (strictly educational/community, not legal registry)
export const submitExpressionOfInterest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { consentToSave, requestMoreInfo, notes } = organDonationInterestSchema.parse(req.body);

    let interest = await OrganDonationInterest.findOne({ user: req.user._id });

    if (interest) {
      interest.consentToSave = consentToSave;
      interest.requestMoreInfo = requestMoreInfo;
      interest.notes = notes;
      interest.isWithdrawn = false;
      interest.withdrawnAt = undefined;
      interest.submittedAt = new Date();
      await interest.save();
    } else {
      interest = await OrganDonationInterest.create({
        user: req.user._id,
        consentToSave,
        requestMoreInfo,
        notes,
        submittedAt: new Date(),
      });
    }

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'ORGAN_DONATION_INTEREST_SUBMITTED',
      targetType: 'OrganDonationInterest',
      targetId: interest._id.toString(),
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message:
        'Your expression of interest has been recorded in JeevaLink. Remember to also register officially on NOTTO and talk with your family!',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's expression of interest
export const getMyExpressionOfInterest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const interest = await OrganDonationInterest.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      interest: interest && !interest.isWithdrawn ? interest : null,
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw expression of interest
export const withdrawExpressionOfInterest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const interest = await OrganDonationInterest.findOne({ user: req.user._id });
    if (!interest) {
      res.status(404).json({ success: false, message: 'No active expression of interest found' });
      return;
    }

    interest.isWithdrawn = true;
    interest.withdrawnAt = new Date();
    await interest.save();

    res.status(200).json({
      success: true,
      message: 'Your expression of interest has been withdrawn.',
    });
  } catch (error) {
    next(error);
  }
};
