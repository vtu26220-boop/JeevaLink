import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { api } from '../utils/api';
import { BloodGroupBadge } from '../components/common/Badge';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<{
    totalDonors?: number;
    availableDonors?: number;
    openBloodRequests?: number;
    fulfilledBloodRequests?: number;
  }>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch live platform metrics from health/public summary
    api.get<{ success: boolean; stats: any }>('/admin/dashboard')
      .then((res) => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      })
      .catch(() => {
        // Fallback gracefully for anonymous visitors
      });
  }, []);

  const faqs = [
    {
      q: 'How does JeevaLink protect donor privacy and phone numbers?',
      a: 'JeevaLink does not publish donor phone numbers or personal contact details in public search results. When a requester needs assistance, they submit a contact request through the platform. The donor receives an in-app notification and can review the request. Personal contact details are only shared if the donor explicitly chooses to accept.',
    },
    {
      q: 'Does JeevaLink determine medical eligibility or allocate organs?',
      a: 'No. JeevaLink strictly does not determine clinical eligibility, match medical tissue compatibility, allocate organs, or maintain official transplant waitlists. Clinical decisions and legally binding allocations remain entirely within authorized hospital transplant boards and official government bodies like NOTTO.',
    },
    {
      q: 'How can I officially pledge organ donation in India?',
      a: 'To obtain a legally recognized National Organ Donor Card, you should register directly on the official NOTTO portal (notto.mohfw.gov.in) operated by the Ministry of Health, Govt. of India. JeevaLink guides you to verified official channels and offers an educational community expression of interest.',
    },
    {
      q: 'What should I do during an urgent medical emergency?',
      a: 'In critical emergencies requiring immediate blood transfusion or organ trauma care, please contact your hospital blood bank, licensed regional transfusion center, or call national emergency numbers immediately.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-blue-50/70 via-white to-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-[#155EEF] text-xs font-bold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-ping" />
              <span>Connecting Lives. Inspiring Hope.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101828] tracking-tight leading-[1.15]">
              Every Connection <br />
              <span className="bg-gradient-to-r from-[#155EEF] via-[#0D9488] to-[#14B8A6] bg-clip-text text-transparent">
                Can Save a Life.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl mx-auto">
              JeevaLink brings communities together to connect blood donors, support people seeking
              blood, and provide trusted organ donation and transplant-resource information.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/services/blood-donation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-lg shadow-blue-500/25 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Find Blood Donors</span>
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-[#101828] bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
              >
                <span>Explore Our Services</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick Stats Banner (Real DB Stats) */}
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-md">
            <div className="text-center p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#155EEF]">
                {stats.totalDonors !== undefined ? stats.totalDonors : 'Active'}
              </p>
              <p className="text-xs font-semibold text-[#667085] mt-1">Registered Donors</p>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0D9488]">
                {stats.availableDonors !== undefined ? stats.availableDonors : 'Ready'}
              </p>
              <p className="text-xs font-semibold text-[#667085] mt-1">Available Donors</p>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706]">
                {stats.openBloodRequests !== undefined ? stats.openBloodRequests : 'Active'}
              </p>
              <p className="text-xs font-semibold text-[#667085] mt-1">Open Blood Requests</p>
            </div>
            <div className="text-center p-2 border-l border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#16A34A]">
                {stats.fulfilledBloodRequests !== undefined ? stats.fulfilledBloodRequests : '100%'}
              </p>
              <p className="text-xs font-semibold text-[#667085] mt-1">Fulfilled Requests</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Four Healthcare Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#155EEF] mb-2">
            Our Healthcare Services
          </h2>
          <h3 className="text-3xl font-extrabold text-[#101828] tracking-tight">
            Four Pillars of Community Healthcare Support
          </h3>
          <p className="text-sm text-[#667085] mt-3">
            Designed to address critical healthcare needs through verified information, donor
            connectivity, and compassionate support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service 1: Blood Donation */}
          <div className="group rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                1. Blood Donation
              </h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Register as a voluntary blood donor, manage your availability, view your donation
                history, and safely receive contact requests from verified requesters.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Privacy-first contact controls</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant availability toggle</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Filter by blood group & city</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-50 mt-6">
              <Link
                to="/services/blood-donation"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#155EEF] group-hover:translate-x-1 transition-all"
              >
                <span>Register or Find Donors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Service 2: Blood Requirement */}
          <div className="group rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                2. Blood Requirement
              </h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Create urgent blood assistance requests, notify compatible donors, track request status
                in real time, and securely receive consented donor responses.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Hospital & city-level dispatch</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Urgency level categorization</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time tracking dashboard</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-50 mt-6">
              <Link
                to="/services/blood-requirement"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#155EEF] group-hover:translate-x-1 transition-all"
              >
                <span>Post Blood Requirement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Service 3: Organ Donation Information and Registration */}
          <div className="group rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                3. Organ Donation Info & Registration
              </h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Learn how organ and tissue donation saves lives, understand myths vs. facts, and access
                verified government registration channels like NOTTO and SOTTO.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Living vs deceased donation facts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Official NOTTO registry links</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>JeevaLink expression of interest</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-50 mt-6">
              <Link
                to="/services/organ-donation"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#155EEF] group-hover:translate-x-1 transition-all"
              >
                <span>Learn & Register Interest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Service 4: Organ Requirement Information and Assistance */}
          <div className="group rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                4. Organ Requirement Assistance
              </h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Find authorized transplant centres, regional ROTTO desks, and submit non-clinical
                assistance requests to navigate official procedures and resources.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified hospital directory</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Guidance & assistance tracker</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Strict anti-marketplace ethics</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-50 mt-6">
              <Link
                to="/services/organ-requirement"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#155EEF] group-hover:translate-x-1 transition-all"
              >
                <span>Explore Verified Resources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How JeevaLink Works */}
      <section className="bg-slate-50/70 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-2">
              Workflow & Process
            </h2>
            <h3 className="text-3xl font-extrabold text-[#101828] tracking-tight">
              How JeevaLink Works
            </h3>
            <p className="text-sm text-[#667085] mt-3">
              Simple, transparent, and privacy-protected steps to connect patients with volunteer
              donors and reliable healthcare resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#155EEF] font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-[#101828]">Create a Verified Request</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Requesters enter patient blood group, hospital details, required units, and urgency level
                with full accuracy confirmation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0D9488] font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-[#101828]">Discover Compatible Donors</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Filter voluntary donors by blood group, city, and active availability without revealing
                unauthorized personal phone numbers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#D97706] font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-[#101828]">Consent-Based Contact</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                The donor receives an in-app alert. Contact details are released only after the donor
                confirms willingness and availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#16A34A] font-extrabold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-[#101828]">Fulfill & Track Assistance</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Donation takes place at authorized hospital facilities, and the request is updated to
                Fulfilled or Closed with complete audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Blood Donation Awareness & Compatibility Chart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
              <Droplet className="w-3.5 h-3.5" />
              <span>Blood Donation Awareness</span>
            </div>

            <h3 className="text-3xl font-extrabold text-[#101828] tracking-tight">
              One Donation Can Save Up to Three Lives.
            </h3>

            <p className="text-sm text-[#667085] leading-relaxed">
              Human blood cannot be manufactured in a laboratory. Every two seconds, someone in India
              requires urgent blood transfusion for trauma care, emergency surgeries, cancer therapies,
              or thalassemia management.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Safe & Replenishing</h4>
                  <p className="text-xs text-[#667085]">
                    A healthy adult's body replenishes the donated fluid volume within 24 to 48 hours,
                    and red cells within a few weeks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Regular Health Screening</h4>
                  <p className="text-xs text-[#667085]">
                    Licensed blood banks test donated units thoroughly for hemoglobin, blood type, and
                    transmissible infections prior to transfusion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Universal Donors and Recipients</h4>
                  <p className="text-xs text-[#667085]">
                    O Negative is the universal red cell donor, while AB Positive is the universal plasma donor.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/services/blood-donation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all"
              >
                <span>Register as a Blood Donor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Compatibility Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-[#101828] flex items-center justify-between">
              <span>Red Blood Cell Compatibility Guide</span>
              <span className="text-[11px] font-semibold text-slate-400">Clinical Reference</span>
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { group: 'O-', canGive: 'Everyone (Universal Red Cell Donor)', canReceive: 'O- only' },
                { group: 'O+', canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-' },
                { group: 'A-', canGive: 'A-, A+, AB-, AB+', canReceive: 'A-, O-' },
                { group: 'A+', canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-' },
                { group: 'B-', canGive: 'B-, B+, AB-, AB+', canReceive: 'B-, O-' },
                { group: 'B+', canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-' },
                { group: 'AB-', canGive: 'AB-, AB+', canReceive: 'AB-, A-, B-, O-' },
                { group: 'AB+', canGive: 'AB+ only', canReceive: 'All Groups (Universal Recipient)' },
              ].map((item) => (
                <div key={item.group} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="w-12">
                    <BloodGroupBadge group={item.group} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 truncate">
                      Gives to: <span className="font-semibold text-slate-900">{item.canGive}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Receives from: {item.canReceive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Organ Donation Awareness & Official Registration Guidance */}
      <section className="bg-gradient-to-r from-teal-900 via-[#101828] to-slate-900 text-white py-16 rounded-3xl mx-4 sm:mx-8 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Organ Donation Awareness</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Leave a Legacy of Life: Understand Organ Pledging.
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
            In India, organ pledging is coordinated nationally by NOTTO under the Ministry of Health
            and Family Welfare. Even with an official pledge, informing your family is critical because
            next-of-kin legal consent is mandatory by law upon brain-stem death.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h5 className="font-bold text-xs text-teal-300">Living Donation</h5>
              <p className="text-[11px] text-slate-300 mt-1">
                Healthy adults can donate a kidney or liver portion to near relatives, governed by THOA
                hospital authorization committees.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h5 className="font-bold text-xs text-teal-300">Deceased Donation</h5>
              <p className="text-[11px] text-slate-300 mt-1">
                After brain-stem death in an ICU, one deceased donor can save up to 8 lives and heal over
                75 people through tissues.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h5 className="font-bold text-xs text-teal-300">Talk to Family</h5>
              <p className="text-[11px] text-slate-300 mt-1">
                Next-of-kin consent is mandatory in India. Share your decision openly so your loved ones
                can confidently honor your wish.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services/organ-donation"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0f766e] text-white shadow-lg transition-all"
            >
              Explore Official Registration Guidance
            </Link>
            <a
              href="https://notto.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <span>Visit NOTTO Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. Community Participation & Safety Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-50/60 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-[#155EEF] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety, Privacy & Ethics</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">
              Your Privacy and Medical Dignity Come First.
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              We never sell or distribute personal medical data. Donor contact information is hidden
              until the donor provides explicit consent. JeevaLink strictly rejects commercial organ
              transactions in accordance with the Transplantation of Human Organs Act.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/about#privacy"
              className="px-5 py-3 rounded-xl text-xs font-bold bg-white text-[#101828] border border-slate-200 hover:bg-slate-50 text-center transition-all shadow-xs"
            >
              Read Privacy Principles
            </Link>
            <Link
              to="/register"
              className="px-5 py-3 rounded-xl text-xs font-bold bg-[#155EEF] hover:bg-[#1148B8] text-white text-center shadow-md shadow-blue-500/20 transition-all"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#155EEF] mb-2">
            Clear Answers
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left font-bold text-sm text-[#101828] flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#155EEF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-[#667085] leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Contact CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 px-6 rounded-3xl bg-white border border-slate-100 shadow-sm max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl font-extrabold text-[#101828]">
            Have a Question or Need Support?
          </h3>
          <p className="text-xs text-[#667085] max-w-lg mx-auto">
            Our support team is here to assist with platform navigation, verified resources, and
            community inquiries.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#101828] text-white hover:bg-slate-800 transition-all shadow-md"
            >
              <span>Get in Touch with JeevaLink</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
