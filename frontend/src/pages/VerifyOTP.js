import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyOTP = () => {
  const { loginUser, darkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last character
    setOtp(newOtp);
    setError('');

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: otpValue });
      setSuccess('OTP verified! Logging you in...');
      setTimeout(() => {
        loginUser(res.data.user, res.data.token);
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      await API.post('/auth/resend-otp', { email });
      setResendMessage('New OTP sent to your email!');
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setResendMessage('Failed to resend OTP. Please try again.');
    }
    setResendLoading(false);
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const boxBase = `w-12 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition duration-200 ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
  }`;
  const boxClass = (index) => {
    if (otp[index]) return `${boxBase} border-blue-500`;
    return `${boxBase} ${darkMode ? 'border-gray-600 focus:border-blue-500' : 'border-gray-300 focus:border-blue-500'}`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md border ${card}`}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SC</span>
          </div>
          <h1 className={`text-2xl font-bold ${heading}`}>Verify Your Identity</h1>
          <p className={`mt-2 text-sm ${sub}`}>
            We sent a 6-digit OTP to
          </p>
          <p className="text-blue-400 font-medium text-sm mt-1">{email}</p>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-900/40 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Resend message */}
        {resendMessage && (
          <div className={`px-4 py-3 rounded-lg mb-5 text-sm text-center ${
            resendMessage.includes('sent')
              ? 'bg-blue-900/40 border border-blue-500 text-blue-300'
              : 'bg-red-900/40 border border-red-500 text-red-300'
          }`}>
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* OTP Input Boxes */}
          <div>
            <label className={`text-sm font-medium block mb-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter OTP
            </label>
            <div className="flex justify-center space-x-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={boxClass(index)}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            {!canResend ? (
              <p className={`text-sm ${sub}`}>
                OTP expires in{' '}
                <span className={`font-bold ${timer < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatTime(timer)}
                </span>
              </p>
            ) : (
              <p className="text-red-400 text-sm">OTP has expired. Please resend.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className={`w-full py-3 rounded-lg font-medium text-sm transition duration-200 ${
              otp.join('').length === 6 && !loading
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
                <span>Verifying...</span>
              </span>
            ) : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className={`text-sm flex items-center justify-center space-x-1 mx-auto transition ${
                canResend
                  ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                  : `${sub} cursor-not-allowed`
              }`}
            >
              <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
              <span>{resendLoading ? 'Resending...' : "Didn't receive it? Resend OTP"}</span>
            </button>
          </div>
        </form>

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

export default VerifyOTP;