import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  User,
  DonorProfile,
  BloodRequest,
  OrganAssistanceRequest,
  HealthcareResource,
  ContactMessage,
  AuditLogItem,
} from '../types';
import {
  Shield,
  Users,
  Heart,
  Droplet,
  FileText,
  Mail,
  Building2,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Activity,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Badge, BloodGroupBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'donors' | 'blood' | 'organ' | 'resources' | 'messages' | 'audit'
  >('overview');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [bloodGroupStats, setBloodGroupStats] = useState<any[]>([]);
  const [requestStatusStats, setRequestStatusStats] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Tab Data states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [donorsList, setDonorsList] = useState<DonorProfile[]>([]);
  const [bloodList, setBloodList] = useState<BloodRequest[]>([]);
  const [organList, setOrganList] = useState<OrganAssistanceRequest[]>([]);
  const [resourcesList, setResourcesList] = useState<HealthcareResource[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogItem[]>([]);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Modal states for admin actions
  const [editingAssistance, setEditingAssistance] = useState<OrganAssistanceRequest | null>(null);
  const [assistanceStatusVal, setAssistanceStatusVal] = useState<string>('Under Review');
  const [assistanceNoteVal, setAssistanceNoteVal] = useState<string>('');

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceFormData, setResourceFormData] = useState<any>({
    name: '',
    category: 'Authorized Transplant Center',
    city: '',
    state: '',
    address: '',
    specialties: '',
    contactPhone: '',
    contactEmail: '',
    websiteUrl: '',
    sourceReference: 'Verified State Appropriate Authority Directory',
    isOfficial: false,
    isVerified: true,
  });

  // Verify Admin Access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied: Administrator privileges required.');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await api.get<{
        success: boolean;
        stats: any;
        bloodGroupStats: any[];
        requestStatusStats: any[];
      }>('/admin/dashboard');

      if (res.success) {
        setStats(res.stats);
        setBloodGroupStats(
          (res.bloodGroupStats || []).map((b) => ({ name: b._id, donors: b.count }))
        );
        setRequestStatusStats(
          (res.requestStatusStats || []).map((r) => ({ name: r._id, count: r.count }))
        );
      }
    } catch (err: any) {
      toast.error('Failed to load admin stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  // Tab Data Loader
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const loadTabData = async () => {
      setIsLoadingTab(true);
      try {
        if (activeTab === 'users') {
          const res = await api.get<{ success: boolean; users: User[] }>('/admin/users');
          if (res.success) setUsersList(res.users);
        } else if (activeTab === 'donors') {
          const res = await api.get<{ success: boolean; donors: DonorProfile[] }>('/admin/donors');
          if (res.success) setDonorsList(res.donors);
        } else if (activeTab === 'blood') {
          const res = await api.get<{ success: boolean; requests: BloodRequest[] }>(
            '/admin/blood-requests'
          );
          if (res.success) setBloodList(res.requests);
        } else if (activeTab === 'organ') {
          const res = await api.get<{ success: boolean; requests: OrganAssistanceRequest[] }>(
            '/admin/organ-assistance-requests'
          );
          if (res.success) setOrganList(res.requests);
        } else if (activeTab === 'resources') {
          const res = await api.get<{ success: boolean; resources: HealthcareResource[] }>(
            '/healthcare-resources',
            { limit: 50 }
          );
          if (res.success) setResourcesList(res.resources);
        } else if (activeTab === 'messages') {
          const res = await api.get<{ success: boolean; messages: ContactMessage[] }>(
            '/admin/contact-messages'
          );
          if (res.success) setMessagesList(res.messages);
        } else if (activeTab === 'audit') {
          const res = await api.get<{ success: boolean; logs: AuditLogItem[] }>(
            '/admin/audit-logs'
          );
          if (res.success) setAuditLogsList(res.logs);
        }
      } catch (err) {
        toast.error(`Failed to load ${activeTab} data`);
      } finally {
        setIsLoadingTab(false);
      }
    };

    if (activeTab !== 'overview') {
      loadTabData();
    }
  }, [activeTab, user]);

  // Handle Assistance Status & Note Update
  const handleUpdateAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssistance) return;

    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/organ-assistance-requests/${editingAssistance._id}`,
        {
          status: assistanceStatusVal,
          note: assistanceNoteVal,
        }
      );
      if (res.success) {
        toast.success(res.message);
        setEditingAssistance(null);
        setAssistanceNoteVal('');
        // Reload list
        const refreshed = await api.get<{ success: boolean; requests: OrganAssistanceRequest[] }>(
          '/admin/organ-assistance-requests'
        );
        if (refreshed.success) setOrganList(refreshed.requests);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update assistance request');
    }
  };

  // Handle Save Healthcare Resource
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...resourceFormData,
        specialties: typeof resourceFormData.specialties === 'string'
          ? resourceFormData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
          : resourceFormData.specialties,
      };

      const res = await api.post<{ success: boolean; message: string }>('/admin/resources', payload);
      if (res.success) {
        toast.success(res.message);
        setResourceModalOpen(false);
        // Reload
        const ref = await api.get<{ success: boolean; resources: HealthcareResource[] }>(
          '/healthcare-resources',
          { limit: 50 }
        );
        if (ref.success) setResourcesList(ref.resources);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create resource');
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this verified resource?')) return;
    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/admin/resources/${id}`);
      if (res.success) {
        toast.success(res.message);
        setResourcesList((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  // Update Contact Message status
  const handleUpdateMessageStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/contact-messages/${id}`,
        { status }
      );
      if (res.success) {
        toast.success(res.message);
        setMessagesList((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: status as any } : m))
        );
      }
    } catch (err: any) {
      toast.error('Failed to update message');
    }
  };

  const COLORS = ['#155EEF', '#0D9488', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#EC4899', '#64748B'];

  if (!user || user.role !== 'admin') {
    return <LoadingSpinner fullPage message="Verifying administrator credentials..." />;
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-[#101828] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">JeevaLink Administration</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Live management of users, voluntary donors, blood emergency requests, verified transplant
            directory, and support audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Authenticated:</span>
          <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            {user.name} ({user.email})
          </span>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: Activity },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'donors', label: 'Donors Registry', icon: Heart },
          { id: 'blood', label: 'Blood Requests', icon: Droplet },
          { id: 'organ', label: 'Organ Assistance', icon: FileText },
          { id: 'resources', label: 'Healthcare Directory', icon: Building2 },
          { id: 'messages', label: 'Support Messages', icon: Mail },
          { id: 'audit', label: 'Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#155EEF] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {isLoadingStats ? (
            <LoadingSpinner fullPage message="Loading platform analytics..." />
          ) : !stats ? (
            <p className="text-xs text-slate-400">Analytics unavailable.</p>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                  <p className="text-3xl font-extrabold text-[#155EEF]">{stats.totalUsers}</p>
                  <p className="text-[11px] text-slate-500">Registered community members</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Donors</span>
                  <p className="text-3xl font-extrabold text-red-600">{stats.totalDonors}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    {stats.availableDonors} currently available
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Open Blood Requests</span>
                  <p className="text-3xl font-extrabold text-amber-600">{stats.openBloodRequests}</p>
                  <p className="text-[11px] text-slate-500">
                    {stats.fulfilledBloodRequests} successfully fulfilled
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Organ Assistance</span>
                  <p className="text-3xl font-extrabold text-[#0D9488]">
                    {stats.pendingAssistanceRequests}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pending review of {stats.totalAssistanceRequests} total
                  </p>
                </div>
              </div>

              {/* Visual Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Blood Group Distribution Bar Chart */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#101828]">
                    Registered Donors by Blood Group
                  </h3>
                  <div className="h-64">
                    {bloodGroupStats.length === 0 ? (
                      <p className="text-xs text-slate-400 pt-20 text-center">No donor records yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bloodGroupStats}>
                          <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                          <YAxis fontSize={11} stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="donors" fill="#155EEF" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Request Status Distribution Pie Chart */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#101828]">Blood Request Status Distribution</h3>
                  <div className="h-64">
                    {requestStatusStats.length === 0 ? (
                      <p className="text-xs text-slate-400 pt-20 text-center">No requests recorded yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={requestStatusStats}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            fontSize={10}
                          >
                            {requestStatusStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">Registered User Accounts</h2>
            <Badge variant="blue">{usersList.length} Accounts</Badge>
          </div>

          {isLoadingTab ? (
            <LoadingSpinner message="Loading users..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City / State</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 rounded-r-xl">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.city}, {u.state}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'admin' ? 'purple' : 'neutral'} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. DONORS REGISTRY TAB */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">Blood Donors Master Registry</h2>
            <Badge variant="teal">{donorsList.length} Donors</Badge>
          </div>

          {isLoadingTab ? (
            <LoadingSpinner message="Loading donors..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Donor Name</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-4 py-3">Contact Preference</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donorsList.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="px-4 py-3">
                        <BloodGroupBadge group={d.bloodGroup} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.city}, {d.state}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={d.isAvailable ? 'success' : 'neutral'} size="sm">
                          {d.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{d.contactPreference}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.status === 'Active' ? 'blue' : 'danger'} size="sm">
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. BLOOD REQUESTS TAB */}
      {activeTab === 'blood' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">All Blood Assistance Requests</h2>
            <Badge variant="blue">{bloodList.length} Total</Badge>
          </div>

          {isLoadingTab ? (
            <LoadingSpinner message="Loading blood requests..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Hospital / Facility</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Urgency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bloodList.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{req.hospital}</td>
                      <td className="px-4 py-3">
                        <BloodGroupBadge group={req.bloodGroup} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {req.unitsFulfilled}/{req.unitsRequested}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{req.city}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{req.urgency}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            req.status === 'Fulfilled'
                              ? 'success'
                              : req.status === 'Cancelled'
                              ? 'danger'
                              : req.status === 'Contacting Donors'
                              ? 'warning'
                              : 'blue'
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. ORGAN ASSISTANCE TAB */}
      {activeTab === 'organ' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">Organ Assistance Requests Desk</h2>
            <Badge variant="teal">{organList.length} Inquiries</Badge>
          </div>

          {isLoadingTab ? (
            <LoadingSpinner message="Loading inquiries..." />
          ) : (
            <div className="space-y-4">
              {organList.map((req) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#101828]">{req.requesterName}</h4>
                        <Badge
                          variant={
                            req.status === 'Resolved'
                              ? 'success'
                              : req.status === 'Cancelled'
                              ? 'danger'
                              : req.status === 'Under Review'
                              ? 'warning'
                              : 'teal'
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inquiry: <span className="font-semibold text-slate-700">{req.assistanceType}</span> • Contact: {req.contactPhone} ({req.contactEmail}) • Location: {req.city}, {req.state}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAssistance(req);
                        setAssistanceStatusVal(req.status);
                        setAssistanceNoteVal('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#155EEF] bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      Update / Add Note
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                    "{req.briefDescription}"
                  </p>

                  {req.adminNotes && req.adminNotes.length > 0 && (
                    <div className="space-y-1 text-xs text-slate-700 pt-1">
                      <span className="font-bold text-slate-800">Support Coordinator Log:</span>
                      {req.adminNotes.map((note) => (
                        <div key={note._id} className="text-[11px] text-slate-600 pl-2 border-l-2 border-[#0D9488]">
                          {note.note} (by {note.addedByName} on {new Date(note.createdAt).toLocaleDateString()})
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

      {/* 6. HEALTHCARE DIRECTORY TAB */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#101828]">Verified Healthcare Resources</h2>
              <p className="text-xs text-[#667085]">
                Manage accredited transplant centers and government authorities directory
              </p>
            </div>
            <button
              onClick={() => {
                setResourceFormData({
                  name: '',
                  category: 'Authorized Transplant Center',
                  city: '',
                  state: '',
                  address: '',
                  specialties: '',
                  contactPhone: '',
                  contactEmail: '',
                  websiteUrl: '',
                  sourceReference: 'Ministry of Health Official Directory',
                  isOfficial: false,
                  isVerified: true,
                });
                setResourceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Verified Resource</span>
            </button>
          </div>

          <div className="space-y-3">
            {resourcesList.map((res) => (
              <div
                key={res._id}
                className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#101828]">{res.name}</span>
                    <Badge variant={res.isOfficial ? 'success' : 'teal'} size="sm">
                      {res.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {res.city}, {res.state} • Source: {res.sourceReference}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteResource(res._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SUPPORT MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">Public Contact Submissions</h2>
            <Badge variant="blue">{messagesList.length} Messages</Badge>
          </div>

          <div className="space-y-3">
            {messagesList.map((msg) => (
              <div
                key={msg._id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#101828]">{msg.fullName}</span>{' '}
                    <span className="text-xs text-slate-400">({msg.email})</span>
                    <h4 className="font-semibold text-xs text-slate-800 mt-1">
                      Subject: {msg.subject}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        msg.status === 'Closed' || msg.status === 'Replied'
                          ? 'success'
                          : msg.status === 'Under Review'
                          ? 'warning'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {msg.status}
                    </Badge>
                    <select
                      value={msg.status}
                      onChange={(e) => handleUpdateMessageStatus(msg._id, e.target.value)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Replied">Replied</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  "{msg.message}"
                </p>
                <span className="text-[10px] text-slate-400">
                  Received {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#101828]">System Audit Logs</h2>
            <Badge variant="purple">{auditLogsList.length} Logged Actions</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Action</th>
                  <th className="px-4 py-3">Actor Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3 rounded-r-xl">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogsList.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-purple-700">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-700">{log.actorEmail}</td>
                    <td className="px-4 py-2.5 text-slate-500">{log.actorRole}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {log.targetType} {log.targetId ? `(${log.targetId.substring(0, 8)}...)` : ''}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{log.ipAddress || 'internal'}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE ASSISTANCE STATUS */}
      {editingAssistance && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAssistance(null)}
          title="Update Organ Assistance Inquiry"
          subtitle={`Requester: ${editingAssistance.requesterName} • ${editingAssistance.assistanceType}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateAssistance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
              <select
                value={assistanceStatusVal}
                onChange={(e) => setAssistanceStatusVal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Information Required">Information Required</option>
                <option value="Referred to Resource">Referred to Resource</option>
                <option value="Resolved">Resolved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Support Note for User
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide verified guidance, contact coordinates of authorized hospital liaison, or NOTTO procedure explanation..."
                value={assistanceNoteVal}
                onChange={(e) => setAssistanceNoteVal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingAssistance(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e]"
              >
                Save & Notify User
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD HEALTHCARE RESOURCE */}
      {resourceModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setResourceModalOpen(false)}
          title="Add Verified Healthcare Resource"
          subtitle="Publish an accredited hospital, cornea bank, or government transplant authority"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveResource} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={resourceFormData.name}
                onChange={(e) => setResourceFormData({ ...resourceFormData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={resourceFormData.category}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="Government Transplant Authority">Government Transplant Authority</option>
                  <option value="Authorized Transplant Center">Authorized Transplant Center</option>
                  <option value="Licensed Blood Center">Licensed Blood Center</option>
                  <option value="Cornea / Tissue Bank">Cornea / Tissue Bank</option>
                  <option value="Support & Information Desk">Support & Information Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Website URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resourceFormData.websiteUrl}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, websiteUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={resourceFormData.city}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, city: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={resourceFormData.state}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, state: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={resourceFormData.contactPhone}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, contactPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="Kidney Transplant, Liver, Cornea"
                  value={resourceFormData.specialties}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, specialties: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Verification Source Reference</label>
              <input
                type="text"
                required
                value={resourceFormData.sourceReference}
                onChange={(e) =>
                  setResourceFormData({ ...resourceFormData, sourceReference: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResourceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e]"
              >
                Save Verified Resource
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
