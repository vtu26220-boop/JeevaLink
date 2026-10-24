import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { HealthcareResource, OrganAssistanceRequest, AssistanceStatus } from '../types';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Plus,
  Send,
  Clock,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';
import { ExternalLinkModal } from '../components/common/ExternalLinkModal';
import toast from 'react-hot-toast';

export const OrganRequirementPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'directory';

  const [activeTab, setActiveTab] = useState<'directory' | 'request' | 'my-requests'>(
    initialTab as any
  );

  // Directory state
  const [resources, setResources] = useState<HealthcareResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Assistance Request Form state
  const [assistanceForm, setAssistanceForm] = useState({
    requesterName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    assistanceType: 'Authorized Transplant Center Directory Navigation' as const,
    preferredContact: 'Email' as 'Email' | 'Phone',
    briefDescription: '',
    consentToProcess: false,
  });
  const [isSubmittingAssistance, setIsSubmittingAssistance] = useState(false);

  // User's Assistance Requests state
  const [myRequests, setMyRequests] = useState<OrganAssistanceRequest[]>([]);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);

  // External Link Modal state
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

  // Fetch verified resources directory
  const fetchResources = async () => {
    try {
      setIsLoadingResources(true);
      const params: any = {};
      if (filterCategory) params.category = filterCategory;
      if (filterState) params.state = filterState;
      if (filterCity) params.city = filterCity;
      if (searchKeyword) params.search = searchKeyword;

      const res = await api.get<{ success: boolean; resources: HealthcareResource[] }>(
        '/healthcare-resources',
        params
      );
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      toast.error('Failed to load healthcare directory');
    } finally {
      setIsLoadingResources(false);
    }
  };

  // Fetch current user's assistance requests
  const fetchMyRequests = async () => {
    if (!user) return;
    try {
      setIsLoadingMyRequests(true);
      const res = await api.get<{ success: boolean; requests: OrganAssistanceRequest[] }>(
        '/organ-assistance-requests/me'
      );
      if (res.success) {
        setMyRequests(res.requests || []);
      }
    } catch (err) {
      // ignore
    } finally {
      setIsLoadingMyRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchResources();
    } else if (activeTab === 'my-requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  // Submit Assistance Request
  const handleSubmitAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit an assistance request.');
      return;
    }

    if (!assistanceForm.consentToProcess) {
      toast.error('Consent to process your assistance request is required.');
      return;
    }

    try {
      setIsSubmittingAssistance(true);
      const res = await api.post<{
        success: boolean;
        message: string;
        assistanceRequest: OrganAssistanceRequest;
      }>('/organ-assistance-requests', assistanceForm);

      if (res.success) {
        toast.success(res.message);
        setActiveTab('my-requests');
        fetchMyRequests();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit assistance request');
    } finally {
      setIsSubmittingAssistance(false);
    }
  };

  // Cancel assistance request
  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this assistance inquiry?')) return;
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        `/organ-assistance-requests/${id}/cancel`
      );
      if (res.success) {
        toast.success(res.message);
        fetchMyRequests();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status: AssistanceStatus) => {
    switch (status) {
      case 'Resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Referred to Resource':
        return <Badge variant="purple">Referred to Resource</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Information Required':
        return <Badge variant="blue">Information Required</Badge>;
      default:
        return <Badge variant="neutral">Submitted</Badge>;
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Service Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-teal-800 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 fill-white" />
              <span>Service 4: Organ Requirement Assistance & Verified Resources</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Transplant Resources & Assistance Desk
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Find accredited transplant centers and government organ registries, and submit
              non-clinical guidance requests to navigate official procedures and resources.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-teal-800 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Verified Directory
            </button>
            <button
              onClick={() => setActiveTab('request')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'request'
                  ? 'bg-white text-teal-800 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Request Assistance
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my-requests'
                    ? 'bg-white text-teal-800 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                My Inquiries ({myRequests.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Ethical Demarcation Notice */}
      <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-teal-950">Statutory Notice Regarding Organ Allocation:</p>
          <p>
            JeevaLink does not operate as an organ broker or marketplace. We strictly do not determine
            transplant eligibility, allocate organs, match donors, or rank patients. All clinical and
            statutory allocation procedures remain exclusively with authorized hospitals, State SOTTOs,
            and NOTTO under the Transplantation of Human Organs Act.
          </p>
        </div>
      </div>

      {/* TAB 1: VERIFIED RESOURCE DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Verified Healthcare Institutions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                >
                  <option value="">All Categories</option>
                  <option value="Government Transplant Authority">Government Transplant Authority</option>
                  <option value="Authorized Transplant Center">Authorized Transplant Center</option>
                  <option value="Licensed Blood Center">Licensed Blood Center</option>
                  <option value="Cornea / Tissue Bank">Cornea / Tissue Bank</option>
                  <option value="Support & Information Desk">Support & Information Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Search Keywords</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Specialty, hospital name..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                onClick={() => {
                  setFilterCategory('');
                  setFilterState('');
                  setFilterCity('');
                  setSearchKeyword('');
                  fetchResources();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchResources}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Directory</span>
              </button>
            </div>
          </div>

          {/* Resources Cards Grid */}
          {isLoadingResources ? (
            <CardSkeleton count={6} />
          ) : resources.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Healthcare Resources Found"
              description="No authorized centers match your selected filters. Please try widening your search criteria."
              actionText="Reset Search"
              onAction={() => {
                setFilterCategory('');
                setFilterState('');
                setFilterCity('');
                setSearchKeyword('');
                fetchResources();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={item.isOfficial ? 'success' : 'teal'} size="sm">
                        {item.category}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Verified {new Date(item.lastVerifiedDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#101828] leading-snug">{item.name}</h4>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {item.city}, {item.state}
                        </span>
                      </p>
                      {item.contactPhone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-mono font-semibold">{item.contactPhone}</span>
                        </p>
                      )}
                      {item.contactEmail && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{item.contactEmail}</span>
                        </p>
                      )}
                    </div>

                    {item.specialties && item.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.specialties.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Verification Source:</span>{' '}
                      {item.sourceReference}
                    </div>
                  </div>

                  {item.websiteUrl && (
                    <div className="pt-2 border-t border-slate-50">
                      <button
                        onClick={() =>
                          setExternalModalData({
                            isOpen: true,
                            name: item.name,
                            purpose: `Official institutional website for ${item.name}`,
                            url: item.websiteUrl || '',
                          })
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#0D9488] bg-teal-50 hover:bg-teal-100 transition-colors"
                      >
                        <span>Visit Official Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSISTANCE REQUEST FORM */}
      {activeTab === 'request' && (
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#101828]">
              Submit an Organ Assistance Inquiry
            </h2>
            <p className="text-xs text-[#667085]">
              Our coordinators help you locate authorized transplant facilities, official ROTTO/SOTTO
              guidelines, and procedural resources.
            </p>
          </div>

          <form onSubmit={handleSubmitAssistance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requester Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Menon"
                  value={assistanceForm.requesterName}
                  onChange={(e) =>
                    setAssistanceForm({ ...assistanceForm, requesterName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={assistanceForm.contactPhone}
                  onChange={(e) =>
                    setAssistanceForm({ ...assistanceForm, contactPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={assistanceForm.contactEmail}
                  onChange={(e) =>
                    setAssistanceForm({ ...assistanceForm, contactEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Contact
                </label>
                <select
                  value={assistanceForm.preferredContact}
                  onChange={(e) =>
                    setAssistanceForm({
                      ...assistanceForm,
                      preferredContact: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone Call</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai"
                  value={assistanceForm.city}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tamil Nadu"
                  value={assistanceForm.state}
                  onChange={(e) => setAssistanceForm({ ...assistanceForm, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type of Assistance Needed <span className="text-red-500">*</span>
              </label>
              <select
                value={assistanceForm.assistanceType}
                onChange={(e) =>
                  setAssistanceForm({
                    ...assistanceForm,
                    assistanceType: e.target.value as any,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              >
                <option value="Authorized Transplant Center Directory Navigation">
                  Authorized Transplant Center Directory Navigation
                </option>
                <option value="Official Government NOTTO/SOTTO Guidance">
                  Official Government NOTTO/SOTTO Guidance
                </option>
                <option value="General Guidance & Process Explanation">
                  General Guidance & Process Explanation
                </option>
                <option value="Grievance & Resource Contact Assistance">
                  Grievance & Resource Contact Assistance
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brief Non-Clinical Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Briefly describe what informational guidance you are seeking. (Do not paste confidential lab reports or IDs)."
                value={assistanceForm.briefDescription}
                onChange={(e) =>
                  setAssistanceForm({ ...assistanceForm, briefDescription: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={assistanceForm.consentToProcess}
                  onChange={(e) =>
                    setAssistanceForm({ ...assistanceForm, consentToProcess: e.target.checked })
                  }
                  className="mt-0.5 rounded text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className="text-xs text-[#667085] leading-relaxed">
                  I give consent to process this assistance inquiry. I acknowledge that JeevaLink is
                  an educational navigation resource and does not provide clinical diagnoses, allocate
                  organs, or arrange private transplants.
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmittingAssistance}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] shadow-md transition-all disabled:opacity-50"
              >
                <span>
                  {isSubmittingAssistance ? 'Submitting...' : 'Submit Assistance Request'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: USER'S OWN ASSISTANCE INQUIRIES */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          {!user ? (
            <EmptyState
              icon={Building2}
              title="Sign In to View Your Assistance Requests"
              description="Please sign in to track responses, coordinator notes, and resource referrals."
              actionText="Sign In"
              onAction={() => (window.location.href = '/login')}
            />
          ) : isLoadingMyRequests ? (
            <LoadingSpinner fullPage message="Loading assistance inquiries..." />
          ) : myRequests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Assistance Requests Submitted Yet"
              description="If you need help locating accredited transplant centers or understanding NOTTO guidelines, submit an inquiry."
              actionText="Request Assistance"
              onAction={() => setActiveTab('request')}
            />
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-[#101828]">{req.assistanceType}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-slate-500">
                        Location: {req.city}, {req.state} • Submitted:{' '}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {req.status !== 'Resolved' && req.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">Inquiry Description:</p>
                    <p className="leading-relaxed">{req.briefDescription}</p>
                  </div>

                  {/* Admin Notes */}
                  {req.adminNotes && req.adminNotes.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                      <p className="text-xs font-bold text-[#155EEF] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Support Coordinator Updates:</span>
                      </p>
                      {req.adminNotes.map((note) => (
                        <div
                          key={note._id}
                          className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-blue-100/50 space-y-0.5"
                        >
                          <p>{note.note}</p>
                          <p className="text-[10px] text-slate-400">
                            By {note.addedByName} on {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
