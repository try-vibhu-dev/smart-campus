import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { darkMode } = useAuth();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState(''); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/^[a-zA-Z]/.test(val)) return 'Email must start with a letter';
    if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const emailError = validateEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (emailError) return;

    setLoading(true);
    setStatus('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full pl-10 pr-10 py-3 rounded-lg border text-sm focus:outline-none transition duration-200 ${
    darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'
  } ${
    !touched ? (darkMode ? 'border-gray-600 focus:border-blue-500' : 'border-gray-300 focus:border-blue-500')
    : emailError ? 'border-red-500 focus:border-red-500'
    : 'border-green-500 focus:border-green-500'
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md border ${card}`}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SC</span>
          </div>
          <h1 className={`text-2xl font-bold ${heading}`}>Forgot Password?</h1>
          <p className={`mt-2 text-sm ${sub}`}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className={`text-lg font-semibold mb-2 ${heading}`}>Check Your Email!</h2>
            <p className={`text-sm mb-6 ${sub}`}>{message}</p>
            <p className={`text-xs mb-6 ${sub}`}>
              Didn't receive it? Check your spam folder or try again.
            </p>
            <button
              onClick={() => { setStatus(''); setEmail(''); setTouched(false); }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span className="text-sm">{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className={`text-sm font-medium block mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className={inputClass}
                  />
                  {touched && !emailError && email && (
                    <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />
                  )}
                  {touched && emailError && (
                    <AlertCircle size={16} className="absolute right-3 top-3.5 text-red-500" />
                  )}
                </div>
                {touched && emailError && (
                  <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle size={12} /><span>{emailError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-sm transition duration-200 ${
                  !emailError && email
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
                    <span>Sending...</span>
                  </span>
                ) : 'Send Reset Link'}
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

export default ForgotPassword;