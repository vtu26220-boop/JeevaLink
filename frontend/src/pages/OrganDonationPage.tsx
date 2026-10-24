import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { OrganDonationInterest } from '../types';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  Search,
  ChevronDown,
  Heart,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ExternalLinkModal } from '../components/common/ExternalLinkModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const OrganDonationPage: React.FC = () => {
  const { user } = useAuth();

  // Official resources & FAQs
  const [resources, setResources] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchFaq, setSearchFaq] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Expression of Interest state
  const [myInterest, setMyInterest] = useState<OrganDonationInterest | null>(null);
  const [interestConsent, setInterestConsent] = useState(false);
  const [requestMoreInfo, setRequestMoreInfo] = useState(false);
  const [interestNotes, setInterestNotes] = useState('');
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // External link modal state
  const [externalModalData, setExternalModalData] = useState<{
    isOpen: boolean;
    name: string;
    purpose: string;
    url: string;
  }>({
    isOpen: false,
    name: '',
    purpose: '',
    url: '',
  });

  useEffect(() => {
    // Load official resources and FAQs from backend
    api.get<{ success: boolean; resources: any[] }>('/organ-donation/resources')
      .then((res) => {
        if (res.success && res.resources) setResources(res.resources);
      })
      .catch(() => {});

    api.get<{ success: boolean; faqs: any[] }>('/organ-donation/faq')
      .then((res) => {
        if (res.success && res.faqs) setFaqs(res.faqs);
      })
      .catch(() => {});

    if (user) {
      api.get<{ success: boolean; interest: OrganDonationInterest | null }>(
        '/organ-donation/interest/me'
      )
        .then((res) => {
          if (res.success && res.interest) setMyInterest(res.interest);
        })
        .catch(() => {});
    }
  }, [user]);

  // Submit Expression of Interest
  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to record your expression of interest.');
      return;
    }

    if (!interestConsent) {
      toast.error('Please confirm consent to save this expression of interest.');
      return;
    }

    try {
      setIsSubmittingInterest(true);
      const res = await api.post<{
        success: boolean;
        message: string;
        interest: OrganDonationInterest;
      }>('/organ-donation/interest', {
        consentToSave: interestConsent,
        requestMoreInfo,
        notes: interestNotes,
      });

      if (res.success && res.interest) {
        toast.success(res.message);
        setMyInterest(res.interest);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit expression of interest');
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  // Withdraw Expression of Interest
  const handleWithdrawInterest = async () => {
    try {
      setIsWithdrawing(true);
      const res = await api.post<{ success: boolean; message: string }>(
        '/organ-donation/interest/withdraw'
      );
      if (res.success) {
        toast.success(res.message);
        setMyInterest(null);
        setInterestConsent(false);
        setInterestNotes('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.category.toLowerCase().includes(searchFaq.toLowerCase())
  );

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Service Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 fill-white" />
            <span>Service 3: Educational Guidance & Official Pledging</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Organ Donation Information & Official Registration
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Understand how organ and tissue donation saves lives, clear common misconceptions, and
            access verified official Government of India channels (NOTTO) for official donor pledging.
          </p>
        </div>
      </div>

      {/* Legal & Medical Demarcation Notice */}
      <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#155EEF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">Statutory Compliance & Legal Guidance:</p>
          <p>
            Official organ donor cards and legal pledges in India are registered solely through NOTTO
            (National Organ and Tissue Transplant Organisation, Ministry of Health and Family Welfare).
            JeevaLink is an independent educational platform and does NOT determine medical eligibility,
            allocate organs, or maintain legal registries.
          </p>
        </div>
      </div>

      {/* 1. Core Educational Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-base text-[#101828]">What Organ Donation Means</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Organ donation is the surgical transfer of healthy organs or tissues from a donor to a
            person suffering from end-stage organ failure. Organs that can be donated include kidney,
            liver, heart, lungs, pancreas, and intestine. Tissues include corneas, skin, bone, and heart
            valves.
          </p>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-base text-[#101828]">Living vs Deceased Donation</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Living donors can donate one kidney or a portion of their liver to a near relative under
            strict legal protocols to prevent commercial exploitation. Deceased organ donation takes
            place only after brain-stem death has been declared in an ICU by a statutory board of four
            physicians.
          </p>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-base text-[#101828]">Mandatory Family Consent</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Under the Transplantation of Human Organs and Tissues Act, the legal next-of-kin must give
            written consent before organs can be retrieved. Pledging a donor card is a statement of wish;
            having an open discussion with your family today ensures they honor your noble decision.
          </p>
        </div>
      </div>

      {/* 2. Verified Official External Registration Guidance */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Verified External Portals
          </span>
          <h2 className="text-2xl font-bold text-[#101828] mt-1">
            Official Government Registration Channels (India)
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Before proceeding, please note that clicking any of these links will redirect you to genuine
            government websites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-[#101828]">{res.name}</h3>
                  <Badge variant="success" size="sm">
                    Official
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{res.authority}</p>
                <p className="text-xs text-[#667085] leading-relaxed">{res.purpose}</p>
                {res.helpline && (
                  <p className="text-[11px] text-[#0D9488] font-semibold">
                    Helpline: {res.helpline}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() =>
                    setExternalModalData({
                      isOpen: true,
                      name: res.name,
                      purpose: res.purpose,
                      url: res.websiteUrl,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#155EEF] bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <span>Go to Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Optional Community Expression-of-Interest Form */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF]">
              JeevaLink Community Expression of Interest
            </span>
            <Badge variant="purple" size="sm">
              Non-Legal Registry
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-[#101828] mt-1">
            Express Your Wish to Support Organ Donation
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            This internal record is strictly an expression of interest to receive educational materials
            and celebrate your noble intent within JeevaLink. It does not replace the official NOTTO
            pledge.
          </p>
        </div>

        {myInterest ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950">
                  Expression of Interest Recorded on JeevaLink
                </h4>
              </div>
              <span className="text-xs text-emerald-800">
                Submitted on {new Date(myInterest.submittedAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              Thank you for expressing your wish to inspire hope through organ donation. Remember to
              officially register on the NOTTO portal and inform your family members!
            </p>

            {myInterest.notes && (
              <p className="text-xs text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-100">
                Your notes: "{myInterest.notes}"
              </p>
            )}

            <div className="pt-2">
              <button
                onClick={handleWithdrawInterest}
                disabled={isWithdrawing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isWithdrawing ? 'Withdrawing...' : 'Withdraw Expression of Interest'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitInterest} className="space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileCheck className="w-4 h-4 text-[#155EEF]" />
                <span>Notice Regarding Community Pledges:</span>
              </div>
              <p>
                By checking the box below, you record a voluntary community expression of interest on
                JeevaLink. This is not a legal document and does not allocate organs. You can withdraw
                your expression anytime.
              </p>
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={interestConsent}
                  onChange={(e) => setInterestConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#155EEF] focus:ring-[#155EEF]"
                />
                <span className="text-xs text-[#667085] leading-relaxed">
                  I consent to saving my expression of interest on JeevaLink. I understand this is an
                  informational record, not legal consent or official NOTTO registration.
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={requestMoreInfo}
                  onChange={(e) => setRequestMoreInfo(e.target.checked)}
                  className="rounded text-[#155EEF] focus:ring-[#155EEF]"
                />
                <span>Send me educational updates about official organ donation procedures</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Note / Family Discussion Comments
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Discussed with family members; interested in cornea & tissue donation..."
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingInterest}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] shadow-md transition-all disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>
                {isSubmittingInterest ? 'Saving...' : 'Record Community Expression of Interest'}
              </span>
            </button>
          </form>
        )}
      </div>

      {/* 4. Expandable / Searchable FAQ Section */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#101828]">Organ Donation FAQ</h2>
            <p className="text-xs text-[#667085]">
              Answers to common legal, medical, and ethical questions regarding organ donation
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchFaq}
              onChange={(e) => setSearchFaq(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/40"
              >
                <button
                  onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                  className="w-full px-5 py-4 text-left font-bold text-xs text-[#101828] flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#155EEF]">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#155EEF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#667085] leading-relaxed border-t border-slate-100 pt-3 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* External Link Redirect Modal */}
      <ExternalLinkModal
        isOpen={externalModalData.isOpen}
        onClose={() => setExternalModalData({ ...externalModalData, isOpen: false })}
        resourceName={externalModalData.name}
        resourcePurpose={externalModalData.purpose}
        targetUrl={externalModalData.url}
      />
    </div>
  );
};
