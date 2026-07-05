import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, X } from 'lucide-react';

const Complaints = () => {
  const { darkMode } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'wifi' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get('/complaints/my', { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchComplaints(), 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/complaints', form);
      setMessage('Complaint submitted successfully!');
      setForm({ title: '', description: '', category: 'wifi' });
      fetchComplaints();
    } catch (err) {
      setMessage('Failed to submit complaint');
    }
    setLoading(false);
  };

  const statusColor = (status) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'in-progress') return 'bg-blue-500/20 text-blue-400';
    return 'bg-green-500/20 text-green-400';
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  const hasFilters = search || statusFilter || categoryFilter;

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inner = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';

  return (
    <div className={`min-h-screen ${bg} p-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 animate-fade-up ${heading}`}>Complaint Management</h1>

        <div className={`border rounded-2xl p-6 mb-8 hover-lift animate-fade-up delay-1 ${card}`}>
          <h2 className={`text-xl font-semibold mb-4 ${heading}`}>Submit a Complaint</h2>
          {message && (
            <div className="bg-blue-900/50 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg mb-4 text-sm animate-pop-in">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Complaint Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            >
              <option value="wifi">WiFi Issue</option>
              <option value="classroom">Classroom Issue</option>
              <option value="hostel">Hostel Issue</option>
              <option value="library">Library Issue</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Describe your complaint..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm h-32 ${input}`}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${heading}`}>My Complaints</h2>
            {hasFilters && (
              <button onClick={clearFilters} className={`text-xs flex items-center space-x-1 hover:underline transition-colors duration-200 ${sub}`}>
                <X size={14} /><span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            >
              <option value="">All Categories</option>
              <option value="wifi">WiFi</option>
              <option value="classroom">Classroom</option>
              <option value="hostel">Hostel</option>
              <option value="library">Library</option>
              <option value="other">Other</option>
            </select>
          </div>

          {complaints.length === 0 ? (
            <p className={`text-sm ${sub}`}>No complaints found.</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((c, i) => (
                <div key={c._id} className={`rounded-xl p-4 border hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${inner}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${heading}`}>{c.title}</h3>
                      <p className={`text-sm mt-1 ${sub}`}>{c.description}</p>
                      <span className={`text-xs mt-2 block capitalize ${sub}`}>Category: {c.category}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaints;