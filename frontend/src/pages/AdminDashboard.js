import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Users, AlertCircle, Bell, Package,
  BookOpen, CheckCircle, Clock, Loader,
  TrendingUp, ChevronRight, UserPlus, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, AlertCircle, Bell, Package, BookOpen, CheckCircle, Clock, Loader, TrendingUp, ChevronRight, UserPlus, Image as ImageIcon, X } from 'lucide-react';

const AdminDashboard = () => {
  const { darkMode } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: '', content: '', category: 'general' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [announcementImage, setAnnouncementImage] = useState(null);
  const [announcementImagePreview, setAnnouncementImagePreview] = useState(null);
  const announcementImageRef = React.useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/stats/admin');
        setStats(res.data.stats);
        setRecentComplaints(res.data.recentComplaints);
        setRecentStudents(res.data.recentStudents);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/complaints/${id}`, { status });
      setRecentComplaints(recentComplaints.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) { console.error(err); }
  };

  const handleAnnouncement = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('title', announcement.title);
    formData.append('content', announcement.content);
    formData.append('category', announcement.category);
    if (announcementImage) formData.append('image', announcementImage);

    await API.post('/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setMessage('Announcement posted successfully!');
    setAnnouncement({ title: '', content: '', category: 'general' });
    setAnnouncementImage(null);
    setAnnouncementImagePreview(null);
    setTimeout(() => setMessage(''), 3000);
  } catch (err) {
    setMessage('Failed to post announcement');
  }
};

  const statusColor = (status) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'in-progress') return 'bg-blue-500/20 text-blue-400';
    return 'bg-green-500/20 text-green-400';
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inner = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  const selectInner = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: darkMode ? '#f9fafb' : '#111827',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className={sub}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} p-6`}>
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8 animate-fade-up">
          <h1 className={`text-3xl font-bold ${heading}`}>Admin Dashboard</h1>
          <p className={`mt-1 text-sm ${sub}`}>Manage and monitor campus activities</p>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Total Complaints', value: stats?.totalComplaints ?? 0, icon: <AlertCircle size={20} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { label: 'Pending', value: stats?.pendingComplaints ?? 0, icon: <Clock size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { label: 'Resolved', value: stats?.resolvedComplaints ?? 0, icon: <CheckCircle size={20} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { label: 'Announcements', value: stats?.totalAnnouncements ?? 0, icon: <Bell size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          ].map((s, i) => (
            <div key={i} className={`border rounded-2xl p-5 hover-lift animate-pop-in delay-${Math.min(i + 1, 6)} ${card}`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className={`text-3xl font-bold ${heading}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── SECOND ROW STATS ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Lost & Found Posts', value: stats?.totalLostFound ?? 0, icon: <Package size={18} />, color: 'text-yellow-400' },
            { label: 'Active Lost Items', value: stats?.activeLostFound ?? 0, icon: <Package size={18} />, color: 'text-orange-400' },
            { label: 'Classrooms', value: stats?.totalClassrooms ?? 0, icon: <BookOpen size={18} />, color: 'text-green-400' },
          ].map((s, i) => (
            <div key={i} className={`border rounded-2xl p-4 flex items-center space-x-4 hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${card}`}>
              <div className={`text-2xl font-bold ${heading}`}>{s.value}</div>
              <div>
                <p className={`text-xs ${sub}`}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── COMPLAINT PROGRESS BAR ── */}
        {stats?.totalComplaints > 0 && (
          <div className={`border rounded-2xl p-6 mb-8 animate-fade-up ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Overall Complaint Resolution</h2>
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            <div className="flex rounded-full overflow-hidden h-3 mb-3">
              <div className="bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.resolvedComplaints / stats.totalComplaints) * 100}%` }} />
              <div className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(stats.inProgressComplaints / stats.totalComplaints) * 100}%` }} />
              <div className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${(stats.pendingComplaints / stats.totalComplaints) * 100}%` }} />
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" /><span className={sub}>Resolved ({stats.resolvedComplaints})</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" /><span className={sub}>In Progress ({stats.inProgressComplaints})</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-yellow-500 rounded-full inline-block" /><span className={sub}>Pending ({stats.pendingComplaints})</span></span>
            </div>
          </div>
        )}

        {/* ── CHARTS ── */}
        {stats?.totalComplaints > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Bar Chart — Complaints by Category */}
            <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-1 ${card}`}>
              <div className="flex items-center space-x-2 mb-6">
                <BarChart2 size={20} className="text-blue-400" />
                <h2 className={`font-semibold ${heading}`}>Complaints by Category</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.categoryBreakdown}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart — Complaints by Status */}
            <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp size={20} className="text-blue-400" />
                <h2 className={`font-semibold ${heading}`}>Complaints by Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.statusBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: darkMode ? '#d1d5db' : '#374151', fontSize: '12px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Post Announcement */}
          <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-1 ${card}`}>
            <h2 className={`font-semibold mb-4 ${heading}`}>Post Announcement</h2>
            {message && (
              <div className={`px-4 py-3 rounded-xl mb-4 text-sm animate-pop-in ${
                message.includes('successfully')
                  ? 'bg-green-900/40 border border-green-500 text-green-300'
                  : 'bg-red-900/40 border border-red-500 text-red-300'
              }`}>
                {message}
              </div>
            )}
            <form onSubmit={handleAnnouncement} className="space-y-3">
              <input type="text" placeholder="Announcement Title"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                className={`w-full border px-4 py-2.5 rounded-xl focus:outline-none transition text-sm ${input}`}
                required />
              <select value={announcement.category}
                onChange={(e) => setAnnouncement({ ...announcement, category: e.target.value })}
                className={`w-full border px-4 py-2.5 rounded-xl focus:outline-none transition text-sm ${input}`}>
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="seminar">Seminar</option>
                <option value="placement">Placement</option>
              </select>
              <textarea placeholder="Announcement content..."
                value={announcement.content}
                onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                className={`w-full border px-4 py-2.5 rounded-xl focus:outline-none transition text-sm h-28 ${input}`}
                required />
              {/* Image Upload */}
              <div>
                <label className={`text-xs font-medium block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Attach Image (optional)
                </label>
                {!announcementImagePreview ? (
                  <button
                    type="button"
                    onClick={() => announcementImageRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-4 flex items-center justify-center gap-2 text-xs transition-all duration-200 ${
                      darkMode ? 'border-gray-600 hover:border-blue-500 text-gray-400' : 'border-gray-300 hover:border-blue-500 text-gray-500'
                    }`}
                  >
                    <ImageIcon size={16} />
                    <span>Click to attach image</span>
                  </button>
                ) : (
                  <div className="relative inline-block">
                    <img src={announcementImagePreview} alt="Preview" className="h-24 rounded-lg object-cover border border-gray-600" />
                    <button
                      type="button"
                      onClick={() => { setAnnouncementImage(null); setAnnouncementImagePreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={announcementImageRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAnnouncementImage(file);
                      setAnnouncementImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02]">
                Post Announcement
              </button>
            </form>
          </div>

          {/* Recent Complaints */}
          <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Recent Complaints</h2>
              <Link to="/complaints" className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1 transition-colors duration-200">
                <span>View all</span><ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentComplaints.length === 0 ? (
                <p className={`text-sm ${sub}`}>No complaints yet.</p>
              ) : recentComplaints.map((c, i) => (
                <div key={c._id} className={`rounded-xl p-3 border hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${inner}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-medium truncate flex-1 mr-2 ${heading}`}>{c.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className={`text-xs ${sub}`}>By: {c.student?.name}</p>
                  <select value={c.status}
                    onChange={(e) => updateStatus(c._id, e.target.value)}
                    className={`mt-2 w-full border px-2 py-1 rounded-lg text-xs transition-colors duration-200 ${selectInner}`}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Students */}
          <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-3 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Recent Registrations</h2>
              <UserPlus size={18} className="text-blue-400" />
            </div>
            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <p className={`text-sm ${sub}`}>No students yet.</p>
              ) : recentStudents.map((s, i) => (
                <div key={s._id} className={`rounded-xl p-3 border flex items-center space-x-3 hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${inner}`}>
                  <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-xs">
                      {s.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${heading}`}>{s.name}</p>
                    <p className={`text-xs truncate ${sub}`}>{s.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;