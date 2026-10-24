import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { DonorProfile, BloodGroup, BloodRequest, DonorContactRequest } from '../types';
import {
  Heart,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Shield,
  Plus,
  Send,
  Power,
  RotateCcw,
} from 'lucide-react';
import { Badge, BloodGroupBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BloodDonationPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'search';

  const [activeTab, setActiveTab] = useState<'search' | 'register' | 'dashboard'>(
    initialTab as any
  );

  // Discovery state
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterAvailableOnly, setFilterAvailableOnly] = useState<boolean>(true);

  // Donor Dashboard state
  const [myDonorProfile, setMyDonorProfile] = useState<DonorProfile | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<DonorContactRequest[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  // Donor Registration Form state
  const [regForm, setRegForm] = useState({
    bloodGroup: 'O+' as BloodGroup,
    city: user?.city || '',
    state: user?.state || '',
    contactPreference: 'Platform Only' as 'Phone' | 'Email' | 'Platform Only',
    isAvailable: true,
    lastDonationDate: '',
    consentToContact: false,
  });
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Contact Donor Modal state
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<DonorProfile | null>(null);
  const [userBloodRequests, setUserBloodRequests] = useState<BloodRequest[]>([]);
  const [selectedBloodRequestId, setSelectedBloodRequestId] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Fetch Donors for Search
  const fetchDonors = async () => {
    try {
      setIsLoadingDonors(true);
      const params: any = {};
      if (filterBloodGroup) params.bloodGroup = filterBloodGroup;
      if (filterCity) params.city = filterCity;
      if (filterState) params.state = filterState;
      if (filterAvailableOnly) params.isAvailable = 'true';

      const res = await api.get<{ success: boolean; donors: DonorProfile[] }>('/donors', params);
      if (res.success) {
        setDonors(res.donors || []);
      }
    } catch (err: any) {
      toast.error('Could not load donors');
    } finally {
      setIsLoadingDonors(false);
    }
  };

  // Fetch Current Donor Dashboard & Incoming Requests
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoadingDashboard(true);
      const [donorRes, requestsRes] = await Promise.all([
        api.get<{ success: boolean; donor: DonorProfile }>('/donors/me').catch(() => null),
        api.get<{ success: boolean; requests: DonorContactRequest[] }>(
          '/donor-contact-requests/incoming'
        ).catch(() => null),
      ]);

      if (donorRes?.success && donorRes.donor) {
        setMyDonorProfile(donorRes.donor);
        setRegForm({
          bloodGroup: donorRes.donor.bloodGroup,
          city: donorRes.donor.city,
          state: donorRes.donor.state,
          contactPreference: donorRes.donor.contactPreference,
          isAvailable: donorRes.donor.isAvailable,
          lastDonationDate: donorRes.donor.lastDonationDate
            ? new Date(donorRes.donor.lastDonationDate).toISOString().split('T')[0]
            : '',
          consentToContact: donorRes.donor.consentToContact,
        });
      }
      if (requestsRes?.success && requestsRes.requests) {
        setIncomingRequests(requestsRes.requests);
      }
    } catch (err) {
      // silently handle
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      fetchDonors();
    } else if (activeTab === 'dashboard' || activeTab === 'register') {
      fetchDashboardData();
    }
  }, [activeTab]);

  // Load requester's blood requests when opening contact modal
  const openContactModal = async (donor: DonorProfile) => {
    if (!user) {
      toast.error('Please sign in to contact donors.');
      return;
    }
    setSelectedDonorForContact(donor);
    try {
      const res = await api.get<{ success: boolean; requests: BloodRequest[] }>('/blood-requests/me');
      if (res.success && res.requests) {
        const activeReqs = res.requests.filter(
          (r) => r.status === 'Open' || r.status === 'Contacting Donors'
        );
        setUserBloodRequests(activeReqs);
        if (activeReqs.length > 0) {
          setSelectedBloodRequestId(activeReqs[0]._id);
        }
      }
    } catch (e) {
      toast.error('Failed to load your blood requests');
    }
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorForContact || !selectedBloodRequestId) {
      toast.error('Please select a blood request to proceed.');
      return;
    }

    try {
      setIsSendingContact(true);
      const res = await api.post<{ success: boolean; message: string }>(
        '/donor-contact-requests',
        {
          bloodRequestId: selectedBloodRequestId,
          donorId: selectedDonorForContact._id,
          message: contactMessage,
        }
      );

      if (res.success) {
        toast.success(res.message);
        setSelectedDonorForContact(null);
        setContactMessage('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send contact request');
    } finally {
      setIsSendingContact(false);
    }
  };

  // Toggle availability
  const handleToggleAvailability = async () => {
    try {
      setIsTogglingAvailability(true);
      const res = await api.patch<{ success: boolean; message: string; isAvailable: boolean }>(
        '/donors/me/availability'
      );
      if (res.success) {
        toast.success(res.message);
        setMyDonorProfile((prev) => (prev ? { ...prev, isAvailable: res.isAvailable } : null));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  // Donor responds to contact request
  const handleRespondRequest = async (requestId: string, status: 'Accepted' | 'Declined') => {
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/donor-contact-requests/${requestId}/respond`,
        { status }
      );
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit response');
    }
  };

  // Register or Update Donor Profile
  const handleSubmitDonorReg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to register as a donor.');
      return;
    }

    if (!regForm.consentToContact) {
      toast.error('Explicit consent is required to receive contact requests.');
      return;
    }

    try {
      setIsSubmittingReg(true);
      const res = await api.post<{ success: boolean; message: string; donor: DonorProfile }>(
        '/donors',
        regForm
      );
      if (res.success && res.donor) {
        toast.success(res.message);
        setMyDonorProfile(res.donor);
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to register as donor');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Service Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Service 1: Voluntary Blood Donor Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Blood Donation & Donor Discovery
            </h1>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              Connect with registered voluntary blood donors, register your pledge to save lives, and
              manage your availability with complete privacy protection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Discover Donors
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Donor Registration
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-red-700 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Donor Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: DONOR SEARCH & DISCOVERY */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Available Donors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                >
                  <option value="">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={filterAvailableOnly}
                    onChange={(e) => setFilterAvailableOnly(e.target.checked)}
                    className="rounded text-[#155EEF] focus:ring-[#155EEF]"
                  />
                  <span>Show Available Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                onClick={() => {
                  setFilterBloodGroup('');
                  setFilterCity('');
                  setFilterState('');
                  setFilterAvailableOnly(true);
                  fetchDonors();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchDonors}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Donors</span>
              </button>
            </div>
          </div>

          {/* Donor Cards Grid */}
          {isLoadingDonors ? (
            <CardSkeleton count={6} />
          ) : donors.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No Donors Found Matching Your Criteria"
              description="Try adjusting your blood group or location filters, or invite local donors in your area to register on JeevaLink."
              actionText="Reset Search"
              onAction={() => {
                setFilterBloodGroup('');
                setFilterCity('');
                setFilterState('');
                fetchDonors();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor) => (
                <div
                  key={donor._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-sm shadow-xs">
                          {donor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#101828]">{donor.name}</h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {donor.city}, {donor.state}
                            </span>
                          </p>
                        </div>
                      </div>
                      <BloodGroupBadge group={donor.bloodGroup} />
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Current Status:</span>
                        <Badge variant={donor.isAvailable ? 'success' : 'neutral'} size="sm">
                          {donor.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Contact Method:</span>
                        <span className="font-semibold text-slate-800">{donor.contactPreference}</span>
                      </div>
                      {donor.lastDonationDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Last Donated:</span>
                          <span className="font-medium text-slate-700">
                            {new Date(donor.lastDonationDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Phone hidden for privacy. Requires consent.</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-50">
                    <button
                      onClick={() => openContactModal(donor)}
                      disabled={!donor.isAvailable}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Contact</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DONOR REGISTRATION FORM */}
      {activeTab === 'register' && (
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#101828]">
              {myDonorProfile ? 'Update Donor Profile' : 'Register as a Voluntary Blood Donor'}
            </h2>
            <p className="text-xs text-[#667085]">
              Thank you for pledging to donate blood. Your details will be visible to individuals seeking
              emergency blood matches.
            </p>
          </div>

          <form onSubmit={handleSubmitDonorReg} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                value={regForm.bloodGroup}
                onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value as BloodGroup })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regForm.city}
                  onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regForm.state}
                  onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Preference
                </label>
                <select
                  value={regForm.contactPreference}
                  onChange={(e) =>
                    setRegForm({
                      ...regForm,
                      contactPreference: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                >
                  <option value="Platform Only">Platform In-App Notifications Only</option>
                  <option value="Phone">Phone Calls / SMS (upon consent)</option>
                  <option value="Email">Email Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Donation Date (Optional)
                </label>
                <input
                  type="date"
                  value={regForm.lastDonationDate}
                  onChange={(e) => setRegForm({ ...regForm, lastDonationDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={regForm.isAvailable}
                  onChange={(e) => setRegForm({ ...regForm, isAvailable: e.target.checked })}
                  className="rounded text-[#155EEF] focus:ring-[#155EEF]"
                />
                <span>I am currently available to be contacted for blood donation</span>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Medical Notice:</span>
              </div>
              <p>
                Donation eligibility is assessed strictly at authorized blood centers by qualified
                medical staff prior to transfusion. JeevaLink does not determine clinical fitness.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={regForm.consentToContact}
                  onChange={(e) => setRegForm({ ...regForm, consentToContact: e.target.checked })}
                  className="mt-0.5 rounded text-[#155EEF] focus:ring-[#155EEF]"
                />
                <span className="text-xs text-[#667085] leading-relaxed">
                  I give explicit consent to be listed in the JeevaLink blood donor registry and to
                  receive contact inquiries for blood assistance. I understand I can pause or withdraw
                  my listing anytime.
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <span>
                  {isSubmittingReg
                    ? 'Saving...'
                    : myDonorProfile
                    ? 'Update Donor Profile'
                    : 'Submit Donor Registration'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DONOR DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {isLoadingDashboard ? (
            <LoadingSpinner fullPage message="Loading donor dashboard..." />
          ) : !myDonorProfile ? (
            <EmptyState
              icon={Heart}
              title="You Haven't Registered as a Donor Yet"
              description="Register your blood group to help people during critical surgeries and trauma emergencies."
              actionText="Register Now"
              onAction={() => setActiveTab('register')}
            />
          ) : (
            <div className="space-y-8">
              {/* Personalized Welcome & Controls */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Active Donor Dashboard
                    </span>
                    <Badge variant={myDonorProfile.isAvailable ? 'success' : 'neutral'}>
                      {myDonorProfile.isAvailable ? 'Available for Donation' : 'Currently Unavailable'}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#101828] mt-1">
                    Welcome, {user?.name}!
                  </h2>
                  <p className="text-xs text-[#667085] mt-1">
                    Blood Group: <span className="font-bold text-red-600">{myDonorProfile.bloodGroup}</span> • Location: {myDonorProfile.city}, {myDonorProfile.state}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleToggleAvailability}
                    disabled={isTogglingAvailability}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      myDonorProfile.isAvailable
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {myDonorProfile.isAvailable
                        ? 'Set as Unavailable'
                        : 'Set as Ready to Donate'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('register')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Edit Donor Profile
                  </button>
                </div>
              </div>

              {/* Incoming Contact Requests */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">Incoming Contact Requests</h3>
                    <p className="text-xs text-[#667085]">
                      Requesters in your region seeking your compatible blood group ({myDonorProfile.bloodGroup})
                    </p>
                  </div>
                  <Badge variant="blue">{incomingRequests.length} Total</Badge>
                </div>

                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No incoming blood assistance requests at this time.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((req) => {
                      const bloodReq = typeof req.bloodRequest === 'object' ? req.bloodRequest : null;
                      const requester = typeof req.requester === 'object' ? req.requester : null;

                      return (
                        <div
                          key={req._id}
                          className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#101828]">
                                  {requester?.name || 'A patient family representative'}
                                </span>
                                <Badge
                                  variant={
                                    req.status === 'Accepted'
                                      ? 'success'
                                      : req.status === 'Declined'
                                      ? 'danger'
                                      : 'warning'
                                  }
                                  size="sm"
                                >
                                  {req.status}
                                </Badge>
                              </div>
                              {bloodReq && (
                                <p className="text-xs text-slate-600 mt-1">
                                  Facility: <span className="font-semibold">{bloodReq.hospital}</span> ({bloodReq.city}) • {bloodReq.unitsRequested} units needed
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {req.message && (
                            <p className="text-xs text-[#667085] italic bg-white p-3 rounded-xl border border-slate-100">
                              "{req.message}"
                            </p>
                          )}

                          {req.status === 'Pending' && (
                            <div className="pt-2 flex items-center gap-3">
                              <button
                                onClick={() => handleRespondRequest(req._id, 'Accepted')}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
                              >
                                Accept & Share Contact Details
                              </button>
                              <button
                                onClick={() => handleRespondRequest(req._id, 'Declined')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Decline Politely
                              </button>
                            </div>
                          )}

                          {req.status === 'Accepted' && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                You accepted this request. Contact details have been shared with the requester.
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: SUBMIT CONTACT REQUEST TO DONOR */}
      {selectedDonorForContact && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDonorForContact(null)}
          title={`Contact Donor: ${selectedDonorForContact.name}`}
          subtitle={`Blood Group: ${selectedDonorForContact.bloodGroup} • Location: ${selectedDonorForContact.city}, ${selectedDonorForContact.state}`}
          maxWidth="md"
        >
          <form onSubmit={handleSendContact} className="space-y-4">
            {userBloodRequests.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 text-xs text-amber-900 space-y-2">
                <p className="font-bold">No Active Blood Request Found</p>
                <p>
                  To contact a donor, you must have an active Blood Request published on JeevaLink.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonorForContact(null);
                    setSearchParams({ tab: 'create' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                >
                  Create Blood Request
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Your Blood Request
                  </label>
                  <select
                    value={selectedBloodRequestId}
                    onChange={(e) => setSelectedBloodRequestId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                  >
                    {userBloodRequests.map((req) => (
                      <option key={req._id} value={req._id}>
                        {req.hospital} ({req.city}) — {req.bloodGroup} ({req.unitsRequested} units)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message to Donor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Briefly describe timing or specific patient need..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF] resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 text-[11px] text-[#155EEF] space-y-1">
                  <p className="font-bold">Privacy Protocol:</p>
                  <p>
                    The donor will receive an in-app notification. If they accept, their phone and email
                    will be revealed in your Blood Requirement dashboard.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDonorForContact(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingContact}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingContact ? 'Sending...' : 'Send Contact Request'}</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};
