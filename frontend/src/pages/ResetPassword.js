import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { darkMode } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (field, value) => {
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Minimum 6 characters';
      if (!/[a-zA-Z]/.test(value)) return 'Must contain at least one letter';
      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    }
    if (field === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (value !== form.password) return 'Passwords do not match';
    }
    return '';
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400', width: 'w-1/3' };
    if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-400', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-400', width: 'w-full' };
  };

  const isFormValid = () => !validate('password', form.password) && !validate('confirmPassword', form.confirmPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      setTouched({ ...touched, [name]: true });
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const res = await API.put(`/auth/reset-password/${token}`, { password: form.password });
      setStatus('success');
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const getInputClass = (field) => {
    const base = `w-full pl-10 pr-10 py-3 rounded-lg border text-sm focus:outline-none transition duration-200 ${
      darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;
    if (!touched[field]) return `${base} ${darkMode ? 'border-gray-600 focus:border-blue-500' : 'border-gray-300 focus:border-blue-500'}`;
    if (validate(field, form[field])) return `${base} border-red-500`;
    return `${base} border-green-500`;
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const strength = getPasswordStrength(form.password);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md border ${card}`}>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SC</span>
          </div>
          <h1 className={`text-2xl font-bold ${heading}`}>Reset Password</h1>
          <p className={`mt-2 text-sm ${sub}`}>Enter your new password below</p>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className={`text-lg font-semibold mb-2 ${heading}`}>Password Reset!</h2>
            <p className={`text-sm mb-2 ${sub}`}>{message}</p>
            <p className={`text-xs ${sub}`}>Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span className="text-sm">{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* New Password */}
              <div>
                <label className={`text-sm font-medium block mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 6 chars, letters & numbers"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('password')}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength?.color} ${strength?.width}`} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strength?.text}`}>Strength: {strength?.label}</p>
                  </div>
                )}
                {touched.password && validate('password', form.password) && (
                  <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle size={12} /><span>{validate('password', form.password)}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`text-sm font-medium block mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('confirmPassword')}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.confirmPassword && validate('confirmPassword', form.confirmPassword) && (
                  <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle size={12} /><span>{validate('confirmPassword', form.confirmPassword)}</span>
                  </p>
                )}
                {touched.confirmPassword && !validate('confirmPassword', form.confirmPassword) && form.confirmPassword && (
                  <p className="text-green-400 text-xs mt-1 flex items-center space-x-1">
                    <CheckCircle size={12} /><span>Passwords match!</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-sm transition duration-200 ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Resetting...</span>
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm flex items-center justify-center space-x-1 ${sub} hover:text-blue-400 transition`}>
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;