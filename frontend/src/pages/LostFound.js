import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, Search, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

const LostFound = () => {
  const { darkMode, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', type: 'lost', location: '', contactInfo: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');

  const fetchPosts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (resolvedFilter) params.resolved = resolvedFilter;

      const res = await API.get('/lostfound', { params });
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const delay = setTimeout(() => fetchPosts(), 300);
    return () => clearTimeout(delay);
  }, [search, typeFilter, resolvedFilter]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      formData.append('location', form.location);
      formData.append('contactInfo', form.contactInfo);
      if (imageFile) formData.append('image', imageFile);

      await API.post('/lostfound', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Post created successfully!');
      setForm({ title: '', description: '', type: 'lost', location: '', contactInfo: '' });
      removeImage();
      fetchPosts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create post');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/lostfound/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setResolvedFilter('');
  };

  const hasFilters = search || typeFilter || resolvedFilter;

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
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 animate-fade-up ${heading}`}>Lost & Found</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-6 items-start">

          {/* ── FORM (left, ~38%) ── */}
          <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-1 ${card} lg:sticky lg:top-8`}>
            <h2 className={`text-xl font-semibold mb-4 ${heading}`}>Post an Item</h2>
            {message && (
              <div className={`px-4 py-3 rounded-lg mb-4 text-sm animate-pop-in ${
                message.includes('successfully')
                  ? 'bg-blue-900/50 border border-blue-500 text-blue-300'
                  : 'bg-red-900/50 border border-red-500 text-red-300'
              }`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
              <input
                type="text"
                placeholder="Item Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm h-24 ${input}`}
                required
              />
              <input
                type="text"
                placeholder="Location (where lost/found)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              />
              <input
                type="text"
                placeholder="Contact Info"
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              />

              <div>
                <label className={`text-sm font-medium block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Photo (optional)
                </label>
                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-lg py-8 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                      darkMode ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:bg-gray-800/40' : 'border-gray-300 hover:border-blue-500 text-gray-500 hover:bg-blue-50/40'
                    }`}
                  >
                    <Upload size={24} />
                    <span className="text-sm">Click to upload an image</span>
                    <span className="text-xs">JPG, PNG, WEBP — max 5MB</span>
                  </button>
                ) : (
                  <div className="relative inline-block animate-pop-in">
                    <img src={imagePreview} alt="Preview" className="h-40 rounded-lg border border-gray-600 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-all duration-200 hover:scale-110"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? 'Posting...' : 'Post Item'}
              </button>
            </form>
          </div>

          {/* ── LIST (right, remaining space) ── */}
          <div className={`border rounded-2xl p-6 hover-lift animate-fade-up delay-2 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${heading}`}>All Posts</h2>
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              >
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              <select
                value={resolvedFilter}
                onChange={(e) => setResolvedFilter(e.target.value)}
                className={`border px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 text-sm ${input}`}
              >
                <option value="">All Posts</option>
                <option value="false">Active Only</option>
                <option value="true">Resolved Only</option>
              </select>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8 animate-pop-in">
                <Package size={48} className="text-gray-500 mx-auto mb-4" />
                <p className={sub}>No posts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((p, i) => (
                  <div key={p._id} className={`rounded-xl overflow-hidden border hover-lift animate-fade-up delay-${Math.min(i + 1, 6)} ${inner}`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className={`w-full h-24 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                        <ImageIcon size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-medium ${heading}`}>{p.title}</h3>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          {p.isResolved && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                              resolved
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.type === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {p.type}
                          </span>
                          {(user?.role === 'admin' || p.postedBy?._id === user?.id) && (
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                              title="Delete post"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm ${sub}`}>{p.description}</p>
                      {p.location && <p className={`text-xs mt-2 ${sub}`}>📍 {p.location}</p>}
                      {p.contactInfo && <p className={`text-xs mt-1 ${sub}`}>📞 {p.contactInfo}</p>}
                    </div>
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

export default LostFound;