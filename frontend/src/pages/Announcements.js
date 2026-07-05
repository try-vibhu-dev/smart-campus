import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, X } from 'lucide-react';

const Announcements = () => {
  const { darkMode } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get('/announcements', { params });
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchAnnouncements(), 300);
    return () => clearTimeout(delay);
  }, [search, categoryFilter]);

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

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
  };

  const hasFilters = search || categoryFilter;

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const body = darkMode ? 'text-gray-300' : 'text-gray-700';
  const input = darkMode
    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';

  return (
    <div className={`min-h-screen ${bg} p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <h1 className={`text-3xl font-bold ${heading}`}>Announcements</h1>
          {hasFilters && (
            <button onClick={clearFilters} className={`text-xs flex items-center space-x-1 hover:underline transition-colors duration-200 ${sub}`}>
              <X size={14} /><span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 animate-fade-up delay-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="event">Event</option>
            <option value="exam">Exam</option>
            <option value="seminar">Seminar</option>
            <option value="placement">Placement</option>
          </select>
        </div>

        {announcements.length === 0 ? (
          <div className={`border rounded-2xl p-12 text-center animate-pop-in ${card}`}>
            <Bell size={48} className="text-gray-500 mx-auto mb-4" />
            <p className={sub}>No announcements found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a, i) => (
              <div key={a._id} className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${card}`}>
                <div className="flex justify-between items-start mb-3">
                  <h2 className={`text-xl font-semibold ${heading}`}>{a.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0 ml-3 ${categoryColor(a.category)}`}>
                    {a.category}
                  </span>
                </div>
                <p className={body}>{a.content}</p>
                <p className={`text-sm mt-3 ${sub}`}>
                  Posted by {a.postedBy?.name} • {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;