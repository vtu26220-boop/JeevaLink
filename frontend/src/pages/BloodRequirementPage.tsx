import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { BloodRequest, BloodGroup, BloodRequestStatus, BloodRequestUrgency, DonorContactRequest } from '../types';
import {
  Droplet,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  X,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Badge, BloodGroupBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BloodRequirementPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'browse'>(
    initialTab as any
  );

  // User's Requests Dashboard state
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [outgoingContacts, setOutgoingContacts] = useState<DonorContactRequest[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    open: number;
    contactingDonors: number;
    partiallyFulfilled: number;
    fulfilled: number;
    cancelled: number;
  }>({
    total: 0,
    open: 0,
    contactingDonors: 0,
    partiallyFulfilled: 0,
    fulfilled: 0,
    cancelled: 0,
  });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Browse Public Requests state
  const [publicRequests, setPublicRequests] = useState<BloodRequest[]>([]);
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterUrgency, setFilterUrgency] = useState<string>('');
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);

  // Create Request Form state
  const [createForm, setCreateForm] = useState({
    patientName: user?.name || '',
    bloodGroup: 'O+' as BloodGroup,
    unitsRequested: 1,
    hospital: '',
    city: user?.city || '',
    state: user?.state || '',
    requiredDate: new Date().toISOString().split('T')[0],
    urgency: 'Normal' as BloodRequestUrgency,
    preferredContact: 'Phone' as 'Phone' | 'Email' | 'Platform',
    contactPhone: user?.phone || '',
    additionalInfo: '',
    confirmationAccurate: false,
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Update Status Modal state
  const [selectedRequestForUpdate, setSelectedRequestForUpdate] = useState<BloodRequest | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<BloodRequestStatus>('Fulfilled');
  const [unitsFulfilledVal, setUnitsFulfilledVal] = useState<number>(1);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Cancel Request Modal state
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState<BloodRequest | null>(null);
  const [cancelReasonVal, setCancelReasonVal] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch requester's dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoadingDashboard(true);
      const [reqRes, contactsRes] = await Promise.all([
        api.get<{ success: boolean; requests: BloodRequest[]; stats: any }>('/blood-requests/me'),
        api.get<{ success: boolean; requests: DonorContactRequest[] }>(
          '/donor-contact-requests/outgoing'
        ).catch(() => null),
      ]);

      if (reqRes.success) {
        setMyRequests(reqRes.requests || []);
        if (reqRes.stats) setStats(reqRes.stats);
      }
      if (contactsRes?.success && contactsRes.requests) {
        setOutgoingContacts(contactsRes.requests);
      }
    } catch (err: any) {
      toast.error('Failed to load blood requests');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Fetch public active requests
  const fetchPublicRequests = async () => {
    try {
      setIsLoadingPublic(true);
      const params: any = {};
      if (filterBloodGroup) params.bloodGroup = filterBloodGroup;
      if (filterCity) params.city = filterCity;
      if (filterUrgency) params.urgency = filterUrgency;

      const res = await api.get<{ success: boolean; requests: BloodRequest[] }>(
        '/blood-requests',
        params
      );
      if (res.success) {
        setPublicRequests(res.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load active requests');
    } finally {
      setIsLoadingPublic(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'browse') {
      fetchPublicRequests();
    }
  }, [activeTab]);

  // Handle Create Blood Request Submission
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to create a blood request.');
      return;
    }

    if (!createForm.confirmationAccurate) {
      toast.error('Please confirm that details provided are accurate.');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      const res = await api.post<{ success: boolean; message: string; bloodRequest: BloodRequest }>(
        '/blood-requests',
        createForm
      );
      if (res.success) {
        toast.success(res.message);
        setActiveTab('dashboard');
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit blood request');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handle Update Status
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForUpdate) return;

    try {
      setIsUpdatingStatus(true);
      const res = await api.patch<{ success: boolean; message: string; bloodRequest: BloodRequest }>(
        `/blood-requests/${selectedRequestForUpdate._id}`,
        {
          status: updateStatusVal,
          unitsFulfilled: unitsFulfilledVal,
        }
      );
      if (res.success) {
        toast.success(res.message);
        setSelectedRequestForUpdate(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update request');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Cancel
  const handleCancelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForCancel) return;

    try {
      setIsCancelling(true);
      const res = await api.post<{ success: boolean; message: string }>(
        `/blood-requests/${selectedRequestForCancel._id}/cancel`,
        { reason: cancelReasonVal }
      );
      if (res.success) {
        toast.success(res.message);
        setSelectedRequestForCancel(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel request');
    } finally {
      setIsCancelling(false);
    }
  };

  const getUrgencyBadge = (urgency: BloodRequestUrgency) => {
    switch (urgency) {
      case 'Critical':
        return <Badge variant="danger">Critical (Within hours)</Badge>;
      case 'Urgent':
        return <Badge variant="warning">Urgent (Within 24h)</Badge>;
      default:
        return <Badge variant="blue">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: BloodRequestStatus) => {
    switch (status) {
      case 'Fulfilled':
        return <Badge variant="success">Fulfilled</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Contacting Donors':
        return <Badge variant="warning">Contacting Donors</Badge>;
      case 'Partially Fulfilled':
        return <Badge variant="purple">Partially Fulfilled</Badge>;
      case 'Closed':
        return <Badge variant="neutral">Closed</Badge>;
      default:
        return <Badge variant="blue">Open</Badge>;
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Service Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <Droplet className="w-3.5 h-3.5 fill-white" />
              <span>Service 2: Blood Requirement & Patient Assistance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Blood Requests & Fulfillments
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Post urgent blood requirements with hospital location, connect directly with consented
              matching donors, and track real-time fulfillment status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {user && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                My Requests Dashboard
              </button>
            )}
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Post Blood Request
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Browse Active Needs
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Advisory Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Immediate Medical Urgency Advisory:</p>
          <p>
            For emergency room surgeries or acute trauma requiring immediate units, contact hospital
            blood banks or licensed regional transfusion hubs directly. JeevaLink acts as a community
            support facilitator and cannot guarantee instant volunteer physical presence.
          </p>
        </div>
      </div>

      {/* TAB 1: REQUESTER'S PERSONAL DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {!user ? (
            <EmptyState
              icon={Droplet}
              title="Sign In to Manage Your Blood Requests"
              description="Sign in or register to track your created requests, see responses from contacted donors, and update fulfillment progress."
              actionText="Sign In"
              onAction={() => (window.location.href = '/login')}
            />
          ) : isLoadingDashboard ? (
            <LoadingSpinner fullPage message="Loading blood requests..." />
          ) : (
            <div className="space-y-8">
              {/* Database Real Stats Counter */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-[#155EEF]">{stats.total}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Requests</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-blue-600">{stats.open}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Open</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-amber-600">{stats.contactingDonors}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Contacting</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-purple-600">{stats.partiallyFulfilled}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Partial</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{stats.fulfilled}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Fulfilled</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-rose-600">{stats.cancelled}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Cancelled</p>
                </div>
              </div>

              {/* Requests List */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">My Posted Blood Requests</h2>
                    <p className="text-xs text-[#667085]">
                      Manage status transitions, view hospital requirements, and track accepted donors
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Request</span>
                  </button>
                </div>

                {myRequests.length === 0 ? (
                  <EmptyState
                    icon={Droplet}
                    title="No Blood Requests Posted Yet"
                    description="When you or someone in your care needs blood assistance, post a request here to connect with matching voluntary donors."
                    actionText="Post Your First Request"
                    onAction={() => setActiveTab('create')}
                  />
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((req) => (
                      <div
                        key={req._id}
                        className="p-6 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <BloodGroupBadge group={req.bloodGroup} />
                              <h3 className="text-base font-bold text-[#101828]">{req.hospital}</h3>
                              {getUrgencyBadge(req.urgency)}
                              {getStatusBadge(req.status)}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span>Patient/Ref: {req.patientName}</span>
                              <span>•</span>
                              <span>
                                Location: {req.city}, {req.state}
                              </span>
                              <span>•</span>
                              <span>Needed by: {new Date(req.requiredDate).toLocaleDateString()}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {req.status !== 'Fulfilled' && req.status !== 'Cancelled' && req.status !== 'Closed' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequestForUpdate(req);
                                    setUpdateStatusVal('Fulfilled');
                                    setUnitsFulfilledVal(req.unitsRequested);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  Mark Fulfilled
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequestForCancel(req);
                                    setCancelReasonVal('');
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  Cancel Request
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              Units Requested / Fulfilled
                            </span>
                            <p className="font-semibold text-slate-800">
                              {req.unitsFulfilled} / {req.unitsRequested} Unit(s)
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              Preferred Contact Method
                            </span>
                            <p className="font-semibold text-slate-800">
                              {req.preferredContact} ({req.contactPhone || 'On File'})
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              Request Posted
                            </span>
                            <p className="font-semibold text-slate-800">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {req.additionalInfo && (
                          <p className="text-xs text-[#667085] leading-relaxed">
                            <span className="font-bold text-slate-700">Notes:</span> {req.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accepted Donors Contact Release Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-[#101828]">
                      Consented Donor Responses & Contacts
                    </h3>
                  </div>
                  <Badge variant="teal">{outgoingContacts.length} Contacts Tracked</Badge>
                </div>

                {outgoingContacts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    You haven't contacted any individual donors yet. Use "Browse Active Needs" or "Blood Donation" to find donors.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outgoingContacts.map((contact) => {
                      const donor = typeof contact.donor === 'object' ? contact.donor : null;
                      const hasDetails = contact.status === 'Accepted' && contact.sharedContactDetails;

                      return (
                        <div
                          key={contact._id}
                          className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#101828]">
                                Donor: {donor?.name || 'Registered Donor'}
                              </p>
                              {donor && (
                                <p className="text-[11px] text-slate-500">
                                  Blood Group: {donor.bloodGroup} • Location: {donor.city}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                contact.status === 'Accepted'
                                  ? 'success'
                                  : contact.status === 'Declined'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {contact.status}
                            </Badge>
                          </div>

                          {hasDetails ? (
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1.5 text-xs">
                              <p className="font-bold text-emerald-950 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Donor Accepted! Contact Information:</span>
                              </p>
                              <div className="text-emerald-900 space-y-0.5 pt-1">
                                <p className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span className="font-mono font-bold">
                                    {contact.sharedContactDetails?.donorPhone}
                                  </span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{contact.sharedContactDetails?.donorEmail}</span>
                                </p>
                              </div>
                              {contact.responseNote && (
                                <p className="text-[11px] text-emerald-800 italic pt-1">
                                  Donor note: "{contact.responseNote}"
                                </p>
                              )}
                            </div>
                          ) : contact.status === 'Declined' ? (
                            <p className="text-xs text-rose-600">
                              Donor was unavailable. You can search for other matching donors.
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              Awaiting response from donor... Details will be released once consented.
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

      {/* TAB 2: POST BLOOD REQUEST FORM */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#101828]">Create a Blood Assistance Request</h2>
            <p className="text-xs text-[#667085]">
              Please fill out accurate hospital and patient requirement details.
            </p>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requester / Patient Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Sen (or Self)"
                  value={createForm.patientName}
                  onChange={(e) => setCreateForm({ ...createForm, patientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.bloodGroup}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, bloodGroup: e.target.value as BloodGroup })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Units Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={createForm.unitsRequested}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, unitsRequested: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.urgency}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      urgency: e.target.value as BloodRequestUrgency,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent (Within 24 Hours)</option>
                  <option value="Critical">Critical (Within Hours)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hospital / Healthcare Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fortis Hospital, Bannerghatta Road"
                value={createForm.hospital}
                onChange={(e) => setCreateForm({ ...createForm, hospital: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
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
                  placeholder="e.g. Karnataka"
                  value={createForm.state}
                  onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={createForm.requiredDate}
                  onChange={(e) => setCreateForm({ ...createForm, requiredDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={createForm.contactPhone}
                  onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention specific ward, contact person at hospital, or replacement details..."
                value={createForm.additionalInfo}
                onChange={(e) => setCreateForm({ ...createForm, additionalInfo: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF] resize-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={createForm.confirmationAccurate}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, confirmationAccurate: e.target.checked })
                  }
                  className="mt-0.5 rounded text-[#155EEF] focus:ring-[#155EEF]"
                />
                <span className="text-xs text-[#667085] leading-relaxed">
                  I confirm that this blood request is genuine and for a patient currently undergoing
                  medical care at the specified facility.
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <span>{isSubmittingCreate ? 'Publishing Request...' : 'Publish Blood Request'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BROWSE ACTIVE COMMUNITY NEEDS */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Active Blood Requests
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  placeholder="e.g. Mumbai"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                >
                  <option value="">All Urgency Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                onClick={() => {
                  setFilterBloodGroup('');
                  setFilterCity('');
                  setFilterUrgency('');
                  fetchPublicRequests();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchPublicRequests}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Requests</span>
              </button>
            </div>
          </div>

          {isLoadingPublic ? (
            <CardSkeleton count={6} />
          ) : publicRequests.length === 0 ? (
            <EmptyState
              icon={Droplet}
              title="No Active Blood Requests Found"
              description="There are currently no active public blood requests matching your filters."
              actionText="Reset Filters"
              onAction={() => {
                setFilterBloodGroup('');
                setFilterCity('');
                setFilterUrgency('');
                fetchPublicRequests();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <BloodGroupBadge group={req.bloodGroup} />
                        {getUrgencyBadge(req.urgency)}
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#101828]">{req.hospital}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {req.city}, {req.state}
                        </span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-1">
                      <p>
                        Units Required: <span className="font-bold text-slate-900">{req.unitsRequested}</span>
                      </p>
                      <p>Needed by: {new Date(req.requiredDate).toLocaleDateString()}</p>
                      {req.additionalInfo && (
                        <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                          "{req.additionalInfo}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
                    <span>Facility verified</span>
                    <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: UPDATE BLOOD REQUEST STATUS */}
      {selectedRequestForUpdate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequestForUpdate(null)}
          title="Update Blood Request Progress"
          subtitle={`Hospital: ${selectedRequestForUpdate.hospital} (${selectedRequestForUpdate.bloodGroup})`}
          maxWidth="sm"
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Status</label>
              <select
                value={updateStatusVal}
                onChange={(e) => setUpdateStatusVal(e.target.value as BloodRequestStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
              >
                <option value="Partially Fulfilled">Partially Fulfilled</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Units Fulfilled</label>
              <input
                type="number"
                min="0"
                max={selectedRequestForUpdate.unitsRequested}
                value={unitsFulfilledVal}
                onChange={(e) => setUnitsFulfilledVal(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequestForUpdate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: CANCEL BLOOD REQUEST */}
      {selectedRequestForCancel && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequestForCancel(null)}
          title="Cancel Blood Request"
          subtitle="Are you sure you want to cancel this request?"
          maxWidth="sm"
        >
          <form onSubmit={handleCancelRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Requirement arranged via hospital in-house blood bank..."
                value={cancelReasonVal}
                onChange={(e) => setCancelReasonVal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequestForCancel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Active
              </button>
              <button
                type="submit"
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
