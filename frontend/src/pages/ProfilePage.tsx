import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, DonorProfile, BloodRequest, OrganAssistanceRequest } from '../types';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Shield,
  Heart,
  Droplet,
  FileText,
  Edit2,
  Check,
  X,
  LogOut,
  Calendar,
} from 'lucide-react';
import { Badge, BloodGroupBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser, updateUserInState } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Associated user activity
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [myBloodRequests, setMyBloodRequests] = useState<BloodRequest[]>([]);
  const [myAssistanceRequests, setMyAssistanceRequests] = useState<OrganAssistanceRequest[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        city: user.city,
        state: user.state,
      });

      // Fetch user's real database records
      Promise.all([
        api.get<{ success: boolean; donor: DonorProfile }>('/donors/me').catch(() => null),
        api.get<{ success: boolean; requests: BloodRequest[] }>('/blood-requests/me').catch(() => null),
        api.get<{ success: boolean; requests: OrganAssistanceRequest[] }>('/organ-assistance-requests/me').catch(() => null),
      ]).then(([donorRes, bloodRes, assistRes]) => {
        if (donorRes?.success && donorRes.donor) {
          setDonorProfile(donorRes.donor);
        }
        if (bloodRes?.success && bloodRes.requests) {
          setMyBloodRequests(bloodRes.requests);
        }
        if (assistRes?.success && assistRes.requests) {
          setMyAssistanceRequests(assistRes.requests);
        }
        setIsLoadingActivity(false);
      });
    }
  }, [user]);

  if (!user) {
    return <LoadingSpinner fullPage message="Loading profile..." />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.patch<{ success: boolean; message: string; user: User }>('/users/me', formData);
      if (res.success && res.user) {
        updateUserInState(res.user);
        toast.success('Profile updated successfully in MongoDB!');
        setIsEditing(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone,
      city: user.city,
      state: user.state,
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#155EEF] to-[#0D9488] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#101828]">{user.name}</h1>
              <Badge variant={user.role === 'admin' ? 'purple' : 'blue'}>
                Role: {user.role.toUpperCase()}
              </Badge>
              {donorProfile && (
                <BloodGroupBadge group={donorProfile.bloodGroup} />
              )}
            </div>
            <p className="text-xs text-[#667085] mt-1 flex items-center gap-3">
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>ID: {user._id}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-sm transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details & Edit Mode */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#101828]">Account Information</h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Email Address</p>
                  <p className="font-semibold text-slate-900 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</p>
                  <p className="font-semibold text-slate-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                  <p className="font-semibold text-slate-900">
                    {user.city}, {user.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Account Privileges</p>
                  <p className="font-semibold text-slate-900 capitalize">
                    {user.role} {user.isDonor ? '• Registered Donor' : ''}{' '}
                    {user.isRequester ? '• Blood Requester' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Donor Preference Status */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#101828] mb-3">Donor Preference</h3>
            {donorProfile ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Blood Donor Profile</span>
                  <Badge variant={donorProfile.isAvailable ? 'success' : 'neutral'}>
                    {donorProfile.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Blood Group: <span className="font-bold">{donorProfile.bloodGroup}</span> • Contact:{' '}
                  {donorProfile.contactPreference}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-center space-y-2">
                <p className="text-xs text-slate-500">You are not yet registered as a blood donor.</p>
                <button
                  onClick={() => navigate('/services/blood-donation')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#155EEF] bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Register as Donor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Service Activity Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blood Requests Created */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#155EEF]">
                  <Droplet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#101828]">My Blood Assistance Requests</h3>
              </div>
              <button
                onClick={() => navigate('/services/blood-requirement')}
                className="text-xs font-bold text-[#155EEF] hover:underline"
              >
                View All ({myBloodRequests.length})
              </button>
            </div>

            {myBloodRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No blood requests posted yet.</p>
            ) : (
              <div className="space-y-3">
                {myBloodRequests.slice(0, 3).map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <BloodGroupBadge group={req.bloodGroup} />
                        <span className="text-xs font-bold text-[#101828]">{req.hospital}</span>
                        <span className="text-[11px] text-slate-400">({req.city})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {req.unitsRequested} unit(s) requested • Date: {new Date(req.requiredDate).toLocaleDateString()}
                      </p>
                    </div>
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
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Organ Assistance Requests */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0D9488]">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#101828]">My Organ Assistance Requests</h3>
              </div>
              <button
                onClick={() => navigate('/services/organ-requirement')}
                className="text-xs font-bold text-[#0D9488] hover:underline"
              >
                View Details ({myAssistanceRequests.length})
              </button>
            </div>

            {myAssistanceRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No organ assistance inquiries submitted.</p>
            ) : (
              <div className="space-y-3">
                {myAssistanceRequests.slice(0, 3).map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-50/50"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#101828]">{req.assistanceType}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Location: {req.city}, {req.state} • Submitted:{' '}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
