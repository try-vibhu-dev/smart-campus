import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Hash, BookOpen, Lock,
  CheckCircle, AlertCircle, Eye, EyeOff,
  ArrowRight, Loader, Shield
} from 'lucide-react';

const Profile = () => {
  const { darkMode, user, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ name: '', department: '', enrollmentNumber: '' });
  const [editMessage, setEditMessage] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/profile');
        setProfile(res.data.user);
        setEditForm({
          name: res.data.user.name || '',
          department: res.data.user.department || '',
          enrollmentNumber: res.data.user.enrollmentNumber || ''
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage('');
    try {
      const res = await API.put('/profile', editForm);
      setProfile(res.data.user);
      setEditMessage('Profile updated successfully!');
      const token = localStorage.getItem('token');
      login({ ...user, name: res.data.user.name }, token);
      setTimeout(() => setEditMessage(''), 3000);
    } catch (err) {
      setEditMessage(err.response?.data?.message || 'Failed to update profile');
    }
    setEditLoading(false);
  };

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMessage('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMessage('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMessage('New password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await API.put('/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMessage('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMessage(''), 3000);
    } catch (err) {
      setPwMessage(err.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  const goToDashboard = () => {
    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  const label = `text-xs font-medium block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className={sub}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-64px)] ${bg} p-4 md:p-6 overflow-hidden flex flex-col`}>
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* ── Compact Welcome Header ── */}
        <div className={`border rounded-2xl px-6 py-4 mb-4 animate-pop-in ${card} flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-blue-400 font-bold text-lg">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className={`text-lg font-bold ${heading}`}>{profile?.name}</h1>
              <p className={`text-xs capitalize ${sub}`}>
                {profile?.role} {profile?.department ? `• ${profile.department}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={goToDashboard}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 hover:scale-105 flex-shrink-0"
          >
            <span>Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Side-by-side: Edit Profile + Change Password ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">

          {/* Edit Profile */}
          <div className={`border rounded-2xl p-5 hover-lift animate-fade-up delay-1 ${card}`}>
            <div className="flex items-center space-x-2 mb-3">
              <User size={16} className="text-blue-400" />
              <h2 className={`text-sm font-semibold ${heading}`}>Edit Profile</h2>
            </div>

            {editMessage && (
              <div className={`px-3 py-2 rounded-lg mb-3 text-xs flex items-center space-x-2 animate-pop-in ${
                editMessage.includes('successfully')
                  ? 'bg-green-900/40 border border-green-500 text-green-300'
                  : 'bg-red-900/40 border border-red-500 text-red-300'
              }`}>
                {editMessage.includes('successfully') ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                <span>{editMessage}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-2.5">
              <div>
                <label className={label}>Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text" name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={label}>Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs opacity-60 cursor-not-allowed ${input}`}
                  />
                </div>
              </div>

              {profile?.role === 'student' && (
                <div>
                  <label className={label}>Enrollment Number</label>
                  <div className="relative">
                    <Hash size={13} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text" name="enrollmentNumber"
                      value={editForm.enrollmentNumber}
                      onChange={handleEditChange}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={label}>Department</label>
                <div className="relative">
                  <BookOpen size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Food Technology">Food Technology</option>
                    <option value="Agriculture Engineering">Agriculture Engineering</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className={`border rounded-2xl p-5 hover-lift animate-fade-up delay-2 ${card}`}>
            <div className="flex items-center space-x-2 mb-3">
              <Shield size={16} className="text-blue-400" />
              <h2 className={`text-sm font-semibold ${heading}`}>Change Password</h2>
            </div>

            {pwMessage && (
              <div className={`px-3 py-2 rounded-lg mb-3 text-xs flex items-center space-x-2 animate-pop-in ${
                pwMessage.includes('successfully')
                  ? 'bg-green-900/40 border border-green-500 text-green-300'
                  : 'bg-red-900/40 border border-red-500 text-red-300'
              }`}>
                {pwMessage.includes('successfully') ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                <span>{pwMessage}</span>
              </div>
            )}

            <form onSubmit={handlePwSubmit} className="space-y-2.5">
              <div>
                <label className={label}>Current Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    className={`w-full pl-9 pr-9 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition-colors duration-200">
                    {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={label}>New Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Minimum 6 characters"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    className={`w-full pl-9 pr-9 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition-colors duration-200">
                    {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={label}>Confirm New Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-all duration-200 ${input}`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              >
                {pwLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;