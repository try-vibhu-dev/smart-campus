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

      // Update name/email in local auth context + localStorage so navbar updates too
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
  const label = `text-sm font-medium block mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

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
    <div className={`min-h-screen ${bg} p-8`}>
      <div className="max-w-3xl mx-auto">

        {/* ── Welcome Header ── */}
        <div className={`border rounded-2xl p-8 mb-8 animate-pop-in ${card} text-center`}>
          <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-105">
            <span className="text-blue-400 font-bold text-3xl">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className={`text-2xl font-bold ${heading}`}>Welcome, {profile?.name}!</h1>
          <p className={`text-sm mt-1 capitalize ${sub}`}>
            {profile?.role} {profile?.department ? `• ${profile.department}` : ''}
          </p>

          <button
            onClick={goToDashboard}
            className="mt-6 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* ── Edit Profile ── */}
        <div className={`border rounded-2xl p-6 mb-6 hover-lift animate-fade-up delay-1 ${card}`}>
          <div className="flex items-center space-x-2 mb-5">
            <User size={20} className="text-blue-400" />
            <h2 className={`text-lg font-semibold ${heading}`}>Edit Profile</h2>
          </div>

          {editMessage && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm flex items-center space-x-2 animate-pop-in ${
              editMessage.includes('successfully')
                ? 'bg-green-900/40 border border-green-500 text-green-300'
                : 'bg-red-900/40 border border-red-500 text-red-300'
            }`}>
              {editMessage.includes('successfully') ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{editMessage}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className={label}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text" name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={label}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm opacity-60 cursor-not-allowed ${input}`}
                />
              </div>
              <p className={`text-xs mt-1 ${sub}`}>Email cannot be changed</p>
            </div>

            {profile?.role === 'student' && (
              <div>
                <label className={label}>Enrollment Number</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text" name="enrollmentNumber"
                    value={editForm.enrollmentNumber}
                    onChange={handleEditChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={label}>Department</label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
          <div className="flex items-center space-x-2 mb-5">
            <Shield size={20} className="text-blue-400" />
            <h2 className={`text-lg font-semibold ${heading}`}>Change Password</h2>
          </div>

          {pwMessage && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm flex items-center space-x-2 animate-pop-in ${
              pwMessage.includes('successfully')
                ? 'bg-green-900/40 border border-green-500 text-green-300'
                : 'bg-red-900/40 border border-red-500 text-red-300'
            }`}>
              {pwMessage.includes('successfully') ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{pwMessage}</span>
            </div>
          )}

          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className={label}>Current Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors duration-200">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className={label}>New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors duration-200">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className={label}>Confirm New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all duration-200 ${input}`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {pwLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;