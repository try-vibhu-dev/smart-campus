import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Plus, Trash2, Edit2, Check, X,
  ChevronDown, ChevronUp, Loader, Save
} from 'lucide-react';

const ClassroomManager = () => {
  const { darkMode } = useAuth();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Add classroom form
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', building: '', capacity: '', type: 'classroom' });
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomMessage, setRoomMessage] = useState('');

  // Edit classroom
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState({ name: '', building: '', capacity: '', type: 'classroom' });

  // Add schedule slot
  const [addSlotFor, setAddSlotFor] = useState(null);
  const [slotForm, setSlotForm] = useState({ day: 'Monday', startTime: '09:00', endTime: '10:00', subject: '', teacher: '' });
  const [slotLoading, setSlotLoading] = useState(false);

  // Edit schedule slot
  const [editSlot, setEditSlot] = useState(null);
  const [editSlotForm, setEditSlotForm] = useState({ day: 'Monday', startTime: '09:00', endTime: '10:00', subject: '', teacher: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchClassrooms = async () => {
    try {
      const res = await API.get('/classrooms');
      setClassrooms(res.data.classrooms);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchClassrooms(); }, []);

  // ── ADD CLASSROOM ──
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setRoomLoading(true);
    try {
      await API.post('/classrooms', roomForm);
      setRoomMessage('Classroom added successfully!');
      setRoomForm({ name: '', building: '', capacity: '', type: 'classroom' });
      setShowAddRoom(false);
      fetchClassrooms();
      setTimeout(() => setRoomMessage(''), 3000);
    } catch (err) {
      setRoomMessage('Failed to add classroom');
    }
    setRoomLoading(false);
  };

  // ── DELETE CLASSROOM ──
  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this classroom and all its schedules?')) return;
    try {
      await API.delete(`/classrooms/${id}`);
      fetchClassrooms();
    } catch (err) { console.error(err); }
  };

  // ── UPDATE CLASSROOM ──
  const handleUpdateRoom = async (id) => {
    try {
      await API.put(`/classrooms/${id}`, editRoomForm);
      setEditRoomId(null);
      fetchClassrooms();
    } catch (err) { console.error(err); }
  };

  // ── ADD SCHEDULE SLOT ──
  const handleAddSlot = async (e, classroomId) => {
    e.preventDefault();
    setSlotLoading(true);
    try {
      await API.post(`/classrooms/${classroomId}/schedule`, slotForm);
      setAddSlotFor(null);
      setSlotForm({ day: 'Monday', startTime: '09:00', endTime: '10:00', subject: '', teacher: '' });
      fetchClassrooms();
    } catch (err) { console.error(err); }
    setSlotLoading(false);
  };

  // ── DELETE SCHEDULE SLOT ──
  const handleDeleteSlot = async (classroomId, slotId) => {
    try {
      await API.delete(`/classrooms/${classroomId}/schedule/${slotId}`);
      fetchClassrooms();
    } catch (err) { console.error(err); }
  };

  // ── UPDATE SCHEDULE SLOT ──
  const handleUpdateSlot = async (classroomId, slotId) => {
    try {
      await API.put(`/classrooms/${classroomId}/schedule/${slotId}`, editSlotForm);
      setEditSlot(null);
      fetchClassrooms();
    } catch (err) { console.error(err); }
  };

  // ── STYLES ──
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inner = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';

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
    <div className={`min-h-screen ${bg} p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className={`text-3xl font-bold ${heading}`}>Classroom Manager</h1>
            <p className={`text-sm mt-1 ${sub}`}>Add, edit and manage classroom schedules</p>
          </div>
          <button
            onClick={() => setShowAddRoom(!showAddRoom)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
          >
            <Plus size={18} />
            <span>Add Classroom</span>
          </button>
        </div>

        {/* ── SUCCESS MESSAGE ── */}
        {roomMessage && (
          <div className={`px-4 py-3 rounded-xl mb-6 text-sm animate-pop-in ${
            roomMessage.includes('successfully')
              ? 'bg-green-900/40 border border-green-500 text-green-300'
              : 'bg-red-900/40 border border-red-500 text-red-300'
          }`}>
            {roomMessage}
          </div>
        )}

        {/* ── ADD CLASSROOM FORM ── */}
        {showAddRoom && (
          <div className={`border rounded-2xl p-6 mb-6 animate-pop-in ${card}`}>
            <h2 className={`text-lg font-semibold mb-4 ${heading}`}>New Classroom</h2>
            <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" placeholder="Classroom Name (e.g. Lab 3)"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                className={`border px-4 py-2.5 rounded-xl text-sm focus:outline-none transition ${input}`}
                required
              />
              <input
                type="text" placeholder="Building (e.g. Block A)"
                value={roomForm.building}
                onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                className={`border px-4 py-2.5 rounded-xl text-sm focus:outline-none transition ${input}`}
              />
              <input
                type="number" placeholder="Capacity (e.g. 40)"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                className={`border px-4 py-2.5 rounded-xl text-sm focus:outline-none transition ${input}`}
              />
              <select
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                className={`border px-4 py-2.5 rounded-xl text-sm focus:outline-none transition ${input}`}
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
              </select>
              <div className="md:col-span-2 flex items-center space-x-3">
                <button
                  type="submit" disabled={roomLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
                >
                  {roomLoading ? 'Adding...' : 'Add Classroom'}
                </button>
                <button
                  type="button" onClick={() => setShowAddRoom(false)}
                  className={`px-6 py-2.5 rounded-xl font-medium text-sm transition border ${darkMode ? 'border-gray-600 text-gray-400 hover:text-white' : 'border-gray-300 text-gray-500 hover:text-gray-900'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CLASSROOMS LIST ── */}
        {classrooms.length === 0 ? (
          <div className={`border rounded-2xl p-12 text-center ${card}`}>
            <BookOpen size={48} className="text-gray-500 mx-auto mb-4" />
            <p className={sub}>No classrooms yet. Add one above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classrooms.map((room, idx) => (
              <div key={room._id} className={`border rounded-2xl overflow-hidden hover-lift animate-fade-up delay-${Math.min(idx + 1, 6)} ${card}`}>

                {/* ── CLASSROOM HEADER ── */}
                <div className="p-5">
                  {editRoomId === room._id ? (
                    // Edit mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text" placeholder="Name"
                        value={editRoomForm.name}
                        onChange={(e) => setEditRoomForm({ ...editRoomForm, name: e.target.value })}
                        className={`border px-3 py-2 rounded-lg text-sm focus:outline-none transition ${input}`}
                      />
                      <input
                        type="text" placeholder="Building"
                        value={editRoomForm.building}
                        onChange={(e) => setEditRoomForm({ ...editRoomForm, building: e.target.value })}
                        className={`border px-3 py-2 rounded-lg text-sm focus:outline-none transition ${input}`}
                      />
                      <input
                        type="number" placeholder="Capacity"
                        value={editRoomForm.capacity}
                        onChange={(e) => setEditRoomForm({ ...editRoomForm, capacity: e.target.value })}
                        className={`border px-3 py-2 rounded-lg text-sm focus:outline-none transition ${input}`}
                      />
                      <select
                        value={editRoomForm.type}
                        onChange={(e) => setEditRoomForm({ ...editRoomForm, type: e.target.value })}
                        className={`border px-3 py-2 rounded-lg text-sm focus:outline-none transition ${input}`}
                      >
                        <option value="classroom">Classroom</option>
                        <option value="lab">Lab</option>
                      </select>
                      <div className="md:col-span-2 flex space-x-2">
                        <button onClick={() => handleUpdateRoom(room._id)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">
                          <Save size={14} /><span>Save</span>
                        </button>
                        <button onClick={() => setEditRoomId(null)}
                          className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm transition border ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                          <X size={14} /><span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${room.type === 'lab' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                          <BookOpen size={22} className={room.type === 'lab' ? 'text-purple-400' : 'text-blue-400'} />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${heading}`}>{room.name}</h3>
                          <p className={`text-sm ${sub}`}>
                            {room.building} • Capacity: {room.capacity} •
                            <span className={`ml-1 capitalize px-2 py-0.5 rounded-full text-xs font-medium ${room.type === 'lab' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {room.type}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${sub}`}>{room.schedule?.length || 0} slots</span>
                        <button
                          onClick={() => {
                            setEditRoomId(room._id);
                            setEditRoomForm({ name: room.name, building: room.building, capacity: room.capacity, type: room.type });
                          }}
                          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                          title="Edit classroom"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="p-2 rounded-lg transition hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                          title="Delete classroom"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === room._id ? null : room._id)}
                          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                          {expandedId === room._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SCHEDULE SLOTS (expanded) ── */}
                {expandedId === room._id && (
                  <div className={`border-t p-5 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-medium text-sm ${heading}`}>Schedule Slots</h4>
                      <button
                        onClick={() => setAddSlotFor(addSlotFor === room._id ? null : room._id)}
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition"
                      >
                        <Plus size={14} /><span>Add Slot</span>
                      </button>
                    </div>

                    {/* Add slot form */}
                    {addSlotFor === room._id && (
                      <form onSubmit={(e) => handleAddSlot(e, room._id)}
                        className={`rounded-xl p-4 mb-4 border animate-pop-in ${inner}`}>
                        <p className={`text-xs font-medium mb-3 ${sub}`}>New Schedule Slot</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <select value={slotForm.day}
                            onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                            className={`border px-3 py-2 rounded-lg text-xs focus:outline-none transition ${input}`}>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <input type="time" value={slotForm.startTime}
                            onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                            className={`border px-3 py-2 rounded-lg text-xs focus:outline-none transition ${input}`} />
                          <input type="time" value={slotForm.endTime}
                            onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                            className={`border px-3 py-2 rounded-lg text-xs focus:outline-none transition ${input}`} />
                          <input type="text" placeholder="Subject"
                            value={slotForm.subject}
                            onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                            className={`border px-3 py-2 rounded-lg text-xs focus:outline-none transition ${input}`}
                            required />
                          <input type="text" placeholder="Teacher"
                            value={slotForm.teacher}
                            onChange={(e) => setSlotForm({ ...slotForm, teacher: e.target.value })}
                            className={`border px-3 py-2 rounded-lg text-xs focus:outline-none transition ${input}`} />
                          <div className="flex space-x-2">
                            <button type="submit" disabled={slotLoading}
                              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs transition disabled:opacity-60">
                              <Check size={12} /><span>{slotLoading ? 'Adding...' : 'Add'}</span>
                            </button>
                            <button type="button" onClick={() => setAddSlotFor(null)}
                              className={`px-3 py-2 rounded-lg text-xs transition border ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Slots list */}
                    {room.schedule?.length === 0 ? (
                      <p className={`text-sm ${sub}`}>No schedule slots yet. Add one above!</p>
                    ) : (
                      <div className="space-y-2">
                        {room.schedule.map((slot) => (
                          <div key={slot._id} className={`rounded-xl p-3 border ${inner}`}>
                            {editSlot === slot._id ? (
                              // Edit slot mode
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <select value={editSlotForm.day}
                                  onChange={(e) => setEditSlotForm({ ...editSlotForm, day: e.target.value })}
                                  className={`border px-2 py-1.5 rounded-lg text-xs focus:outline-none transition ${input}`}>
                                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <input type="time" value={editSlotForm.startTime}
                                  onChange={(e) => setEditSlotForm({ ...editSlotForm, startTime: e.target.value })}
                                  className={`border px-2 py-1.5 rounded-lg text-xs focus:outline-none transition ${input}`} />
                                <input type="time" value={editSlotForm.endTime}
                                  onChange={(e) => setEditSlotForm({ ...editSlotForm, endTime: e.target.value })}
                                  className={`border px-2 py-1.5 rounded-lg text-xs focus:outline-none transition ${input}`} />
                                <input type="text" placeholder="Subject" value={editSlotForm.subject}
                                  onChange={(e) => setEditSlotForm({ ...editSlotForm, subject: e.target.value })}
                                  className={`border px-2 py-1.5 rounded-lg text-xs focus:outline-none transition ${input}`} />
                                <input type="text" placeholder="Teacher" value={editSlotForm.teacher}
                                  onChange={(e) => setEditSlotForm({ ...editSlotForm, teacher: e.target.value })}
                                  className={`border px-2 py-1.5 rounded-lg text-xs focus:outline-none transition ${input}`} />
                                <div className="flex space-x-2">
                                  <button onClick={() => handleUpdateSlot(room._id, slot._id)}
                                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg text-xs transition">
                                    <Check size={11} /><span>Save</span>
                                  </button>
                                  <button onClick={() => setEditSlot(null)}
                                    className={`px-2 py-1.5 rounded-lg text-xs transition border ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View slot mode
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {slot.day}
                                  </span>
                                  <span className={`text-xs ${sub}`}>{slot.startTime} – {slot.endTime}</span>
                                  <span className={`text-xs font-medium ${heading}`}>{slot.subject}</span>
                                  {slot.teacher && <span className={`text-xs ${sub}`}>• {slot.teacher}</span>}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditSlot(slot._id);
                                      setEditSlotForm({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime, subject: slot.subject, teacher: slot.teacher || '' });
                                    }}
                                    className={`p-1.5 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'}`}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlot(room._id, slot._id)}
                                    className="p-1.5 rounded-lg transition hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomManager;