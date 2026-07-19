import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, X, Trash2, User, Hash, BookOpen, Mail } from 'lucide-react';

const Complaints = () => {
  const { darkMode, user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'professor';

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

      const endpoint = isStaff ? '/complaints/all' : '/complaints/my';
      const res = await API.get(endpoint, { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await API.delete(`/complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/complaints/${id}`, { status });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
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
  const statusSelect = darkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const FormCard = (
    <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-1 ${card} lg:sticky lg:top-8`}>
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
          <option value="other">Other (describe below)</option>
        </select>
        <textarea
          placeholder="Describe your complaint... if it's not one of the categories above, explain it fully here"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm h-32 ${input}`}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );

  const ListCard = (
    <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${heading}`}>
          {isStaff ? 'All Complaints' : 'My Complaints'}
        </h2>
        {hasFilters && (
          <button onClick={clearFilters} className={`text-xs flex items-center space-x-1 hover:underline transition-colors duration-200 ${sub}`}>
            <X size={14} /><span>Clear filters</span>
          </button>
        )}
      </div>

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
                <div className="flex-1 mr-3">
                  <h3 className={`font-medium ${heading}`}>{c.title}</h3>
                  <p className={`text-sm mt-1 ${sub}`}>{c.description}</p>
                  <span className={`text-xs mt-2 block capitalize ${sub}`}>Category: {c.category}</span>

                  {isStaff && c.student && (
                    <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap gap-x-4 gap-y-1`}>
                      <span className={`text-xs flex items-center gap-1 ${sub}`}>
                        <User size={12} /> {c.student.name}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${sub}`}>
                        <Mail size={12} /> {c.student.email}
                      </span>
                      {c.student.enrollmentNumber && (
                        <span className={`text-xs flex items-center gap-1 ${sub}`}>
                          <Hash size={12} /> {c.student.enrollmentNumber}
                        </span>
                      )}
                      {c.student.department && (
                        <span className={`text-xs flex items-center gap-1 ${sub}`}>
                          <BookOpen size={12} /> {c.student.department}
                        </span>
                      )}
                      <span className={`text-xs ${sub}`}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                  {isStaff ? (
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusSelect}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                    title="Delete complaint"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} p-8`}>
      <div className={isStaff ? 'max-w-5xl mx-auto' : 'max-w-7xl mx-auto'}>
        <h1 className={`text-3xl font-bold mb-8 animate-fade-up ${heading}`}>
          {isStaff ? 'Complaint Management' : 'My Complaints'}
        </h1>

        {isStaff ? (
          ListCard
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-6 items-start">
            {FormCard}
            {ListCard}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;