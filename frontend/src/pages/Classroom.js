import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, X, CalendarCheck, Loader } from 'lucide-react';

const Classroom = () => {
  const { darkMode } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Availability checker
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('10:00');
  const [availableRooms, setAvailableRooms] = useState(null);
  const [checking, setChecking] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const res = await API.get('/classrooms');
      setClassrooms(res.data.classrooms);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleCheckAvailability = async () => {
    setChecking(true);
    try {
      const res = await API.get('/classrooms/availability', { params: { day, time } });
      setAvailableRooms(res.data.available);
    } catch (err) {
      console.error(err);
    }
    setChecking(false);
  };

  const filteredClassrooms = classrooms.filter((room) => {
    const matchesSearch =
      !search ||
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.building?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || room.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
  };

  const hasFilters = search || typeFilter;

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inner = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className={sub}>Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} p-8`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 animate-fade-up ${heading}`}>Classroom Availability</h1>

        {/* ── Availability Checker ── */}
        <div className={`border rounded-2xl p-6 mb-8 hover-lift animate-fade-up delay-1 ${card}`}>
          <div className="flex items-center space-x-2 mb-4">
            <CalendarCheck size={20} className="text-blue-400" />
            <h2 className={`text-xl font-semibold ${heading}`}>Check Availability</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            >
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            />
            <button
              onClick={handleCheckAvailability}
              disabled={checking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
          </div>

          {availableRooms !== null && (
            <div className="mt-5 animate-fade-up">
              <p className={`text-sm font-medium mb-3 ${heading}`}>
                {availableRooms.length > 0
                  ? `${availableRooms.length} room(s) free on ${day} at ${time}:`
                  : `No rooms free on ${day} at ${time}.`}
              </p>
              {availableRooms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableRooms.map((room, i) => (
                    <span
                      key={room._id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 animate-pop-in delay-${Math.min(i + 1, 6)}`}
                    >
                      {room.name} ({room.building})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Search + Filter ── */}
        <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${heading}`}>All Classrooms</h2>
            {hasFilters && (
              <button onClick={clearFilters} className={`text-xs flex items-center space-x-1 hover:underline transition-colors duration-200 ${sub}`}>
                <X size={14} /><span>Clear filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or building..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
            >
              <option value="">All Types</option>
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
            </select>
          </div>

          {filteredClassrooms.length === 0 ? (
            <div className="text-center py-8 animate-pop-in">
              <BookOpen size={48} className="text-gray-500 mx-auto mb-4" />
              <p className={sub}>No classrooms found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClassrooms.map((room, i) => (
                <div key={room._id} className={`rounded-xl p-5 border hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${inner}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className={`text-lg font-semibold ${heading}`}>{room.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${room.type === 'lab' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {room.type}
                    </span>
                  </div>
                  <p className={`text-sm ${sub}`}>Building: {room.building}</p>
                  <p className={`text-sm ${sub}`}>Capacity: {room.capacity}</p>
                  {room.schedule?.length > 0 && (
                    <div className="mt-4">
                      <p className={`text-sm font-medium mb-2 ${heading}`}>Schedule:</p>
                      {room.schedule.map((s, i) => (
                        <div key={i} className={`rounded-lg p-2 mb-2 text-xs ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500 border border-gray-200'}`}>
                          {s.day} | {s.startTime} - {s.endTime} | {s.subject}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Classroom;