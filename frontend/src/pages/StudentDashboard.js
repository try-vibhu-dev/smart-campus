import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  AlertCircle, Bell, Package, BookOpen,
  CheckCircle, Clock, Loader, TrendingUp,
  ChevronRight, User
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, darkMode } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/stats/student');
        setStats(res.data.stats);
        setRecentComplaints(res.data.recentComplaints);
        setLatestAnnouncements(res.data.latestAnnouncements);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inner = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';

  const statusColor = (status) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'in-progress') return 'bg-blue-500/20 text-blue-400';
    return 'bg-green-500/20 text-green-400';
  };

  const categoryColor = (cat) => {
    const colors = {
      event: 'bg-purple-500/20 text-purple-400',
      exam: 'bg-red-500/20 text-red-400',
      seminar: 'bg-blue-500/20 text-blue-400',
      placement: 'bg-green-500/20 text-green-400',
      general: 'bg-gray-500/20 text-gray-400'
    };
    return colors[cat] || colors.general;
  };

  const modules = [
    { title: 'Complaints', desc: 'Report campus issues', icon: <AlertCircle size={28} />, link: '/complaints', color: 'bg-red-500' },
    { title: 'Announcements', desc: 'Latest campus news', icon: <Bell size={28} />, link: '/announcements', color: 'bg-blue-500' },
    { title: 'Lost & Found', desc: 'Find lost items', icon: <Package size={28} />, link: '/lostfound', color: 'bg-yellow-500' },
    { title: 'Classrooms', desc: 'Check availability', icon: <BookOpen size={28} />, link: '/classroom', color: 'bg-green-500' },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className={sub}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} p-6`}>
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${heading}`}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p className={`mt-1 text-sm ${sub}`}>
              Here's what's happening on campus today
            </p>
          </div>
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border ${card}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${heading}`}>{user?.name}</p>
              <p className={`text-xs capitalize ${sub}`}>{user?.role}</p>
            </div>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Complaints',
              value: stats?.totalComplaints ?? 0,
              icon: <AlertCircle size={20} />,
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              border: 'border-red-500/20'
            },
            {
              label: 'Pending',
              value: stats?.pendingComplaints ?? 0,
              icon: <Clock size={20} />,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20'
            },
            {
              label: 'Resolved',
              value: stats?.resolvedComplaints ?? 0,
              icon: <CheckCircle size={20} />,
              color: 'text-green-400',
              bg: 'bg-green-500/10',
              border: 'border-green-500/20'
            },
            {
              label: 'Announcements',
              value: stats?.totalAnnouncements ?? 0,
              icon: <Bell size={20} />,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20'
            },
          ].map((s, i) => (
            <div key={i} className={`border rounded-2xl p-5 hover-lift animate-pop-in delay-${i + 1} ${card}`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className={`text-3xl font-bold ${heading}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── COMPLAINT PROGRESS BAR ── */}
        {stats?.totalComplaints > 0 && (
          <div className={`border rounded-2xl p-6 mb-8 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Complaint Resolution Progress</h2>
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            <div className="flex rounded-full overflow-hidden h-3 mb-3">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.resolvedComplaints / stats.totalComplaints) * 100}%` }}
              />
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(stats.inProgressComplaints / stats.totalComplaints) * 100}%` }}
              />
              <div
                className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${(stats.pendingComplaints / stats.totalComplaints) * 100}%` }}
              />
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" /><span className={sub}>Resolved ({stats.resolvedComplaints})</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" /><span className={sub}>In Progress ({stats.inProgressComplaints})</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-yellow-500 rounded-full inline-block" /><span className={sub}>Pending ({stats.pendingComplaints})</span></span>
            </div>
          </div>
        )}

        {/* ── MODULES + RECENT ACTIVITY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Modules */}
          <div className="lg:col-span-1">
            <h2 className={`font-semibold mb-4 ${heading}`}>Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              {modules.map((mod, i) => (
                <Link to={mod.link} key={i}>
                  <div className={`border rounded-2xl p-4 transition duration-200 hover:border-blue-500/50 cursor-pointer hover-lift animate-fade-up delay-${i + 1} ${card}`}>
                    <div className={`${mod.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
                      {mod.icon}
                    </div>
                    <h3 className={`text-sm font-semibold ${heading}`}>{mod.title}</h3>
                    <p className={`text-xs mt-0.5 ${sub}`}>{mod.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Recent Complaints</h2>
              <Link to="/complaints" className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1 transition">
                <span>View all</span><ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentComplaints.length === 0 ? (
                <div className={`border rounded-2xl p-6 text-center ${card}`}>
                  <AlertCircle size={28} className={`mx-auto mb-2 ${sub}`} />
                  <p className={`text-sm ${sub}`}>No complaints yet</p>
                </div>
              ) : recentComplaints.map((c) => (
                <div key={c._id} className={`border rounded-xl p-4 ${inner}`}>
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium truncate flex-1 mr-2 ${heading}`}>{c.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 capitalize ${sub}`}>{c.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Announcements */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${heading}`}>Latest Announcements</h2>
              <Link to="/announcements" className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1 transition">
                <span>View all</span><ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {latestAnnouncements.length === 0 ? (
                <div className={`border rounded-2xl p-6 text-center ${card}`}>
                  <Bell size={28} className={`mx-auto mb-2 ${sub}`} />
                  <p className={`text-sm ${sub}`}>No announcements yet</p>
                </div>
              ) : latestAnnouncements.map((a) => (
                <div key={a._id} className={`border rounded-xl p-4 ${inner}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-medium truncate flex-1 mr-2 ${heading}`}>{a.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 capitalize ${categoryColor(a.category)}`}>
                      {a.category}
                    </span>
                  </div>
                  <p className={`text-xs ${sub}`}>{a.content?.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className={`font-semibold mb-4 ${heading}`}>Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role },
              { label: 'Lost & Found Active', value: `${stats?.activeLostFound ?? 0} items` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className={`text-xs ${sub}`}>{label}</p>
                <p className={`font-medium text-sm mt-0.5 ${heading} ${label === 'Email' ? 'lowercase' : 'capitalize'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;