import React from 'react';
import { ShieldCheck, Heart, Droplet, BookOpen, Building2, CheckCircle2, Lock, Users, Target, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] px-3 py-1 bg-blue-50 rounded-full">
          About JeevaLink
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#101828] tracking-tight">
          Connecting Lives. Inspiring Hope.
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
          JeevaLink is an ethical, community-driven healthcare support network built to simplify
          voluntary blood donor discovery and provide transparent, reliable guidance for organ donation
          and transplant-related resources.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#155EEF] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">Our Mission</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            To eliminate unnecessary delays in emergency blood access and empower families with
            verified, trustworthy information regarding organ donation and authorized healthcare
            centers across India, while upholding the highest standards of personal privacy and medical
            ethics.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">Our Vision</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            A compassionate society where every individual in need of blood can find willing voluntary
            donors, and every family facing organ failure is guided smoothly to verified government
            registries, accredited transplant hospitals, and ethical assistance.
          </p>
        </div>
      </div>

      {/* Project Objectives */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-[#101828]">Core Project Objectives</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Rapid Blood Donor Discovery</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Enable requesters to filter voluntary donors by exact blood group and municipality without
              unprotected exposure of personal phone numbers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Consent-Driven Communication</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Ensure donors maintain total control over when, how, and whether their contact information
              is shared for any incoming request.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Official Government Portal Guidance</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Direct citizens to genuine statutory bodies (NOTTO, ROTTO, SOTTO) for legal pledges, donor
              cards, and waitlist procedures.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Verified Transplant Directory</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Curate authorized hospitals, cornea banks, and transfusion centers with clear source
              references and verified contact lines.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Ethical Demarcation</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Never operate as a commercial organ broker or medical diagnostic provider. Preserve all
              legal boundaries established by Indian healthcare laws.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
              <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
              <span>Accessible & Responsive Experience</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Provide mobile-optimized, fast, accessible interfaces with clear loading, empty, and
              error states for all users.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Overview of the 4 Services */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
            Comprehensive Scope
          </span>
          <h2 className="text-3xl font-extrabold text-[#101828] mt-1">The Four Core Services</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">1. Blood Donation</h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Provides voluntary donors with an intuitive personal dashboard to manage their readiness
              status, record their verified donation dates, log hospital facilities, and accept or decline
              incoming contact requests with full privacy.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#155EEF]">
                <Droplet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">2. Blood Requirement</h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Empowers patients and family representatives to publish urgent blood requests with
              hospital name, units, and urgency level. Enables safe communication with matching donors
              through structured notifications and status tracking (Open, Contacting, Fulfilled, Closed).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#16A34A]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                3. Organ Donation Information & Registration Guidance
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Offers comprehensive education on brain-stem death, living vs deceased donation concepts,
              mandatory family consent requirements, and links to verified official government registration
              portals (NOTTO/SOTTO). Features an optional community expression-of-interest mechanism.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0D9488]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                4. Organ Requirement Assistance & Resource Directory
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Connects patients seeking non-clinical navigation with verified transplant centers, licensed
              cornea banks, and government help desks. Includes an assistance tracking system reviewed by
              administrators for verified procedural guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Safety Principles (Anchor id="privacy") */}
      <div id="privacy" className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
          <Lock className="w-4 h-4" />
          <span>Privacy & Security Safeguards</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          Strict Privacy Principles We Follow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-sm">Data Minimization</h4>
            <p>
              We only collect necessary non-clinical data required to establish contact between willing
              donors and requesters. We never demand confidential health diagnosis cards or national ID
              numbers.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-sm">Explicit Consent Protocol</h4>
            <p>
              Donor phone numbers and email addresses are never published openly. A requester's inquiry
              triggers an in-app notification; contact details are revealed only when the donor accepts.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-sm">No Commercial Dealing</h4>
            <p>
              Commercial transaction of organs, blood selling, and fee-based donor brokering are illegal
              and strictly prohibited on JeevaLink. Suspicious activity is immediately blocked and reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
