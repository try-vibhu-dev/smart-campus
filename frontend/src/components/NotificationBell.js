import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Megaphone, Wrench, Package } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const { darkMode } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    if (type === 'announcement') return <Megaphone size={14} className="text-blue-400" />;
    if (type === 'complaint') return <Wrench size={14} className="text-yellow-400" />;
    return <Package size={14} className="text-green-400" />;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const dropdown = darkMode
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200';
  const item = darkMode
    ? 'hover:bg-gray-800 border-gray-700'
    : 'hover:bg-gray-50 border-gray-100';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition duration-200 ${
          darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden ${dropdown}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold text-sm ${heading}`}>
              Notifications {unreadCount > 0 && <span className="text-blue-400">({unreadCount} new)</span>}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className={`mx-auto mb-2 ${sub}`} />
                <p className={`text-sm ${sub}`}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex items-start space-x-3 px-4 py-3 border-b cursor-pointer transition ${item} ${
                    !n.isRead ? (darkMode ? 'bg-blue-900/10' : 'bg-blue-50') : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${heading}`}>{n.title}</p>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${sub}`}>{n.message}</p>
                    <p className={`text-xs mt-1 ${sub}`}>{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-3 border-t text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => { markAllRead(); setOpen(false); }}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 mx-auto transition"
              >
                <Check size={12} />
                <span>Clear all notifications</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;