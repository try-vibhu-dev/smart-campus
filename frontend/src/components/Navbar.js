import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Bell, Package, BookOpen, AlertCircle, Sun, Moon, Menu, X, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, darkMode, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/announcements', icon: <Bell size={18} />, label: 'Announcements' },
    { to: '/complaints', icon: <AlertCircle size={18} />, label: 'Complaints' },
    { to: '/lostfound', icon: <Package size={18} />, label: 'Lost & Found' },
    { to: '/classroom', icon: <BookOpen size={18} />, label: 'Classrooms' },
  ];

  const isActive = (path) => location.pathname === path;

  const nav = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const brand = darkMode ? 'text-white' : 'text-gray-900';
  const userLabel = darkMode ? 'text-gray-400' : 'text-gray-500';

  const linkClass = (path) => {
    const active = isActive(path);
    const base = 'flex items-center space-x-1.5 text-sm px-3 py-2 rounded-lg transition duration-200';
    if (active) return `${base} ${darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'} font-medium`;
    return `${base} ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`;
  };

  const mobileLinkClass = (path) => {
    const active = isActive(path);
    const base = 'flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-medium';
    if (active) return `${base} ${darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`;
    return `${base} ${darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`;
  };

  return (
    <>
      <nav className={`border-b px-4 md:px-6 py-3 sticky top-0 z-40 ${nav}`}>
        <div className="flex items-center justify-between">

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className={`font-bold text-base hidden sm:block ${brand}`}>Smart Campus</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ to, icon, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                {icon}<span>{label}</span>
              </Link>
            ))}

            {/* Admin links */}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  <span className={`font-medium text-sm ${isActive('/admin') ? '' : 'text-yellow-500'}`}>
                    Admin Panel
                  </span>
                </Link>
                <Link to="/admin/classrooms" className={linkClass('/admin/classrooms')}>
                  <span className={`font-medium text-sm ${isActive('/admin/classrooms') ? '' : 'text-green-500'}`}>
                    Classroom Mgr
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition duration-200 ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Button */}
            <Link
              to="/profile"
              className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg transition duration-200 ${
                isActive('/profile')
                  ? darkMode ? 'bg-blue-600/20' : 'bg-blue-50'
                  : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              title="View Profile"
            >
              <div className="w-7 h-7 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-blue-400 font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className={`text-sm hidden md:block ${userLabel}`}>
                {user?.name?.split(' ')[0]}
              </span>
            </Link>

            {/* Logout — hidden on mobile */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>

            {/* Hamburger — visible only on mobile/tablet */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-2 rounded-lg transition duration-200 ${
                darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className={`lg:hidden fixed inset-x-0 top-[57px] z-30 border-b shadow-xl ${
          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="px-4 py-4 space-y-1">

            {/* Nav Links */}
            {navLinks.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={mobileLinkClass(to)}
                onClick={() => setMenuOpen(false)}
              >
                {icon}<span>{label}</span>
              </Link>
            ))}

            {/* Admin links */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={mobileLinkClass('/admin')}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-yellow-500">⚙</span>
                  <span className="text-yellow-500 font-medium">Admin Panel</span>
                </Link>
                <Link
                  to="/admin/classrooms"
                  className={mobileLinkClass('/admin/classrooms')}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-green-500">🏫</span>
                  <span className="text-green-500 font-medium">Classroom Manager</span>
                </Link>
              </>
            )}

            {/* Profile link */}
            <Link
              to="/profile"
              className={mobileLinkClass('/profile')}
              onClick={() => setMenuOpen(false)}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>

            {/* Divider */}
            <div className={`my-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* User info + Logout */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name}
                  </p>
                  <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;