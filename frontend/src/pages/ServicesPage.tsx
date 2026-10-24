import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Droplet, BookOpen, Building2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const services = [
    {
      id: 'blood-donation',
      title: 'Blood Donation',
      category: 'Donor Engagement & Community Support',
      icon: Heart,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      link: '/services/blood-donation',
      description:
        'A dedicated service for compassionate voluntary blood donors. Register your blood group, update your live availability toggle, track your past donation history, and receive safe contact requests from verified requesters.',
      features: [
        'Donor Profile with blood group and municipality location',
        'One-click Availability status toggle (Available / Unavailable)',
        'Personal donation history tracking with date and hospital facility',
        'Consent-guarded incoming contact requests dashboard',
        'Option to withdraw donor listing at any time',
      ],
      actionText: 'Go to Blood Donation',
    },
    {
      id: 'blood-requirement',
      title: 'Blood Requirement',
      category: 'Emergency & Urgent Assistance',
      icon: Droplet,
      iconColor: 'text-[#155EEF]',
      iconBg: 'bg-blue-50',
      badgeColor: 'bg-blue-50 text-[#155EEF] border-blue-200',
      link: '/services/blood-requirement',
      description:
        'A structured workflow for patients and family representatives seeking urgent blood units. Post requirements with hospital name, units needed, and urgency level, discover matching voluntary donors, and track progress.',
      features: [
        'Post blood request with patient facility, required date, and urgency',
        'Discover matching available donors filtered by blood group and city',
        'Send contact request to matching consented donors',
        'Track statuses: Open, Contacting Donors, Partially Fulfilled, Fulfilled',
        'Emergency advisory for critical hospital transfusion units',
      ],
      actionText: 'Go to Blood Requirement',
    },
    {
      id: 'organ-donation',
      title: 'Organ Donation Information and Registration',
      category: 'Public Health Education & Government Guidance',
      icon: BookOpen,
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
      link: '/services/organ-donation',
      description:
        'A comprehensive educational portal detailing organ and tissue donation concepts, living vs. deceased donation, brain-stem death certification, mandatory family consent laws, and verified official government registration portals (NOTTO/SOTTO).',
      features: [
        'Clear educational guides on living and deceased donation',
        'Myths vs. facts addressing common concerns and religious perspectives',
        'Direct verified links to NOTTO national donor pledge portal',
        'JeevaLink community expression-of-interest mechanism (strictly non-legal)',
        'Family discussion guidance for legally required next-of-kin consent',
      ],
      actionText: 'Explore Organ Donation Guidance',
    },
    {
      id: 'organ-requirement',
      title: 'Organ Requirement Information and Assistance',
      category: 'Patient Navigation & Authorized Resources',
      icon: Building2,
      iconColor: 'text-[#0D9488]',
      iconBg: 'bg-teal-50',
      badgeColor: 'bg-teal-50 text-[#0D9488] border-teal-200',
      link: '/services/organ-requirement',
      description:
        'A transparent resource center and non-clinical assistance desk for individuals navigating organ failure. Access verified directories of authorized transplant centers, regional ROTTO desks, and submit non-clinical guidance requests.',
      features: [
        'Verified directory of government authorities and accredited transplant centers',
        'Filterable by state, city, category, and organ specialty',
        'Submit non-clinical assistance request for procedural navigation',
        'Track assistance statuses: Submitted, Under Review, Referred, Resolved',
        'Strict ethical demarcation: JeevaLink is NOT an organ broker or clinic',
      ],
      actionText: 'View Transplant Resources & Assistance',
    },
  ];

  return (
    <div className="py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] px-3 py-1 bg-blue-50 rounded-full">
          Core Healthcare Scope
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#101828] tracking-tight">
          Our Four Healthcare Services
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
          JeevaLink is dedicated exclusively to these four healthcare services. We do not provide
          pharmacy, drug sales, or automated medical diagnostic tools.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-8">
        {services.map((svc, index) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-8"
            >
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${svc.iconBg} ${svc.iconColor} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${svc.badgeColor}`}
                    >
                      Service {index + 1}: {svc.category}
                    </span>
                    <h3 className="text-2xl font-bold text-[#101828] mt-1">{svc.title}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {svc.description}
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Features & Controls:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {svc.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:shrink-0 pt-4 lg:pt-0">
                <Link
                  to={svc.link}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>{svc.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Compliance Card */}
      <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-[#667085] leading-relaxed flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-[#0D9488] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[#101828] text-sm mb-1">
            Ethical Demarcation & Legal Notice
          </h4>
          <p>
            JeevaLink connects people seeking voluntary blood donation assistance with donors and
            provides verified educational information for organ donation. The application does not
            operate as an organ marketplace, determine medical eligibility, allocate organs, or
            replace hospitals, blood banks, or official healthcare systems.
          </p>
        </div>
      </div>
    </div>
  );
};
