import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  Mail, Lock, AlertCircle, CheckCircle,
  Eye, EyeOff, User, Hash, BookOpen, ArrowLeft, Key
} from 'lucide-react';

const AuthPage = () => {
  const { darkMode, loginUser } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [loginServerError, setLoginServerError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', enrollmentNumber: '', department: '', secretKey: ''
  });
  const [regErrors, setRegErrors] = useState({});
  const [regTouched, setRegTouched] = useState({});
  const [regServerError, setRegServerError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const validateLogin = (field, value) => {
    if (field === 'email') {
      if (!value) return 'Email is required';
      if (!/^[a-zA-Z]/.test(value)) return 'Email must start with a letter';
      if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Enter a valid email';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Minimum 6 characters';
    }
    return '';
  };

  const validateReg = (field, value) => {
    if (field === 'name') {
      if (!value) return 'Full name is required';
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'Letters only';
      if (value.trim().length < 3) return 'Minimum 3 characters';
    }
    if (field === 'email') {
      if (!value) return 'Email is required';
      if (!/^[a-zA-Z]/.test(value)) return 'Must start with a letter';
      if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Enter a valid email';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Minimum 6 characters';
      if (!/[a-zA-Z]/.test(value)) return 'Must contain a letter';
      if (!/[0-9]/.test(value)) return 'Must contain a number';
    }
    if (field === 'confirmPassword') {
      if (!value) return 'Please confirm password';
      if (value !== regForm.password) return 'Passwords do not match';
    }
    if (field === 'enrollmentNumber' && regForm.role === 'student') {
      if (!value) return 'Enrollment number required';
    }
    if (field === 'department') {
      if (!value) return 'Department is required';
    }
    if (field === 'secretKey' && (regForm.role === 'admin' || regForm.role === 'professor')) {
      if (!value) return 'Secret key is required';
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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
    if (loginTouched[name]) setLoginErrors({ ...loginErrors, [name]: validateLogin(name, value) });
  };

  const handleLoginBlur = (e) => {
    const { name, value } = e.target;
    setLoginTouched({ ...loginTouched, [name]: true });
    setLoginErrors({ ...loginErrors, [name]: validateLogin(name, value) });
  };

  const isLoginValid = () =>
    loginForm.email && loginForm.password &&
    !validateLogin('email', loginForm.email) &&
    !validateLogin('password', loginForm.password);


 const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const allTouched = { email: true, password: true };
  const allErrors = {
    email: validateLogin('email', loginForm.email),
    password: validateLogin('password', loginForm.password),
  };
  setLoginTouched(allTouched);
  setLoginErrors(allErrors);
  if (allErrors.email || allErrors.password) return;
  setLoginLoading(true);
  setLoginServerError('');
  try {
    const res = await API.post('/auth/login', loginForm);
    loginUser(res.data.user, res.data.token);
    navigate('/dashboard');
  } catch (err) {
    setLoginServerError(err.response?.data?.message || 'Login failed.');
  }
  setLoginLoading(false);
};

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm({ ...regForm, [name]: value });
    if (regTouched[name]) setRegErrors({ ...regErrors, [name]: validateReg(name, value) });
  };

  const handleRegBlur = (e) => {
    const { name, value } = e.target;
    setRegTouched({ ...regTouched, [name]: true });
    setRegErrors({ ...regErrors, [name]: validateReg(name, value) });
  };

  const isRegValid = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    if (regForm.role === 'student') fields.push('enrollmentNumber');
    if (regForm.role === 'admin' || regForm.role === 'professor') fields.push('secretKey');
    return fields.every(f => regForm[f] && !validateReg(f, regForm[f]));
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    if (regForm.role === 'student') fields.push('enrollmentNumber');
    if (regForm.role === 'admin' || regForm.role === 'professor') fields.push('secretKey');
    const allTouched = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
    const allErrors = fields.reduce((acc, f) => ({ ...acc, [f]: validateReg(f, regForm[f]) }), {});
    setRegTouched(allTouched);
    setRegErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;
    setRegLoading(true);
    setRegServerError('');
    try {
      await API.post('/auth/register', regForm);
      setRegSuccess(true);
      setTimeout(() => {
        setIsRegister(false);
        setRegSuccess(false);
        setRegForm({ name: '', email: '', password: '', confirmPassword: '', role: 'student', enrollmentNumber: '', department: '', secretKey: '' });
        setRegTouched({});
        setRegErrors({});
      }, 2000);
    } catch (err) {
      setRegServerError(err.response?.data?.message || 'Registration failed.');
    }
    setRegLoading(false);
  };

  const inputBase = `w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition duration-200 ${
    darkMode ? 'bg-gray-800/80 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'
  }`;

  const getInputClass = (error, touched) => {
    if (!touched) return `${inputBase} ${darkMode ? 'border-gray-600 focus:border-blue-500' : 'border-gray-300 focus:border-blue-500'}`;
    if (error) return `${inputBase} border-red-500`;
    return `${inputBase} border-green-500`;
  };

  const label = `text-xs font-medium block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const strength = getPasswordStrength(regForm.password);

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics',
    'Mechanical', 'Civil', 'Food Technology',
    'Agriculture Engineering', 'AI/ML', 'Administration'
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row overflow-hidden ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>

      {/* ── LOGIN PANEL ── */}
      <div className={`w-full md:w-1/2 flex items-center justify-center px-6 py-8 md:px-8 md:py-12 relative z-10 transition-all duration-500 min-h-screen md:min-h-0 ${
        isRegister ? 'hidden md:flex md:blur-sm md:scale-95 md:opacity-60' : 'flex'
      }`}>
        <div className={`w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border ${
          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Smart Campus</span>
          </div>

          <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome back</h1>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your campus account</p>

          {loginServerError && (
            <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2 text-sm">
              <AlertCircle size={15} /><span>{loginServerError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <div>
              <label className={label}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                <input type="email" name="email" placeholder="yourname@gmail.com"
                  value={loginForm.email} onChange={handleLoginChange} onBlur={handleLoginBlur}
                  className={getInputClass(loginErrors.email, loginTouched.email)} />
                {loginTouched.email && !loginErrors.email && loginForm.email && <CheckCircle size={15} className="absolute right-3 top-3 text-green-500" />}
                {loginTouched.email && loginErrors.email && <AlertCircle size={15} className="absolute right-3 top-3 text-red-500" />}
              </div>
              {loginTouched.email && loginErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={11} /><span>{loginErrors.email}</span></p>
              )}
            </div>

            <div>
              <label className={label}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                <input type={showLoginPassword ? 'text' : 'password'} name="password"
                  placeholder="Enter your password"
                  value={loginForm.password} onChange={handleLoginChange} onBlur={handleLoginBlur}
                  className={getInputClass(loginErrors.password, loginTouched.password)}
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200">
                  {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {loginTouched.password && loginErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={11} /><span>{loginErrors.password}</span></p>
              )}
            </div>

            <button type="submit" disabled={loginLoading}
              className={`w-full py-3 rounded-xl font-medium text-sm transition duration-200 ${
                isLoginValid()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}>
              {loginLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className={`text-center mt-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Don't have an account?{' '}
            <button onClick={() => setIsRegister(true)} className="text-blue-400 hover:text-blue-300 font-medium transition">
              Register here
            </button>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL / REGISTER ── */}
      <div className={`w-full md:w-1/2 flex items-center justify-center relative z-20 min-h-screen md:min-h-0 ${
        isRegister ? 'flex' : 'hidden md:flex'
      }`}>
        <div className={`absolute inset-0 ${
          isRegister
            ? darkMode ? 'bg-gray-950' : 'bg-gray-100'
            : 'bg-gradient-to-br from-blue-900/40 via-gray-900 to-purple-900/40'
        }`} />

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />

        {/* Branding — desktop only */}
        {!isRegister && (
          <div className="relative z-10 text-center px-12 hidden md:block">
            <div className="w-24 h-24 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-400 font-bold text-3xl">SC</span>
            </div>
            <h2 className="text-white text-3xl font-bold mb-3">Smart Campus</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Faculty of Engineering & Technology<br />MGCGV, Chitrakoot
            </p>
            <p className="text-blue-300/70 text-xs italic">"The village is the universe in miniature."</p>
          </div>
        )}

        {/* Register Card */}
        {isRegister && (
          <div className="relative z-10 w-full max-w-md px-4 py-6 md:px-8">
            <button onClick={() => setIsRegister(false)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm mb-4 transition">
              <ArrowLeft size={16} /><span>Back to Login</span>
            </button>

            <div className={`p-6 md:p-8 rounded-3xl shadow-2xl border ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Join Smart Campus today</p>

              {regSuccess && (
                <div className="bg-green-900/40 border border-green-500 text-green-300 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2 text-sm">
                  <CheckCircle size={15} /><span>Account created! Redirecting...</span>
                </div>
              )}
              {regServerError && (
                <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2 text-sm">
                  <AlertCircle size={15} /><span>{regServerError}</span>
                </div>
              )}

              <form onSubmit={handleRegSubmit} className="space-y-3" noValidate>

                {/* Role Toggle */}
                <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-gray-600">
                  {['student', 'professor', 'admin'].map(r => (
                    <button key={r} type="button"
                      onClick={() => setRegForm({ ...regForm, role: r, secretKey: '' })}
                      className={`py-2 text-xs font-medium transition capitalize ${
                        regForm.role === r ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {r === 'professor' ? 'Prof' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Name */}
                <div>
                  <label className={label}>Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" name="name" placeholder="Your full name"
                      value={regForm.name} onChange={handleRegChange} onBlur={handleRegBlur}
                      className={getInputClass(regErrors.name, regTouched.name)} />
                    {regTouched.name && !regErrors.name && regForm.name && <CheckCircle size={14} className="absolute right-3 top-3 text-green-500" />}
                  </div>
                  {regTouched.name && regErrors.name && <p className="text-red-400 text-xs mt-0.5">{regErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={label}>Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input type="email" name="email" placeholder="yourname@gmail.com"
                      value={regForm.email} onChange={handleRegChange} onBlur={handleRegBlur}
                      className={getInputClass(regErrors.email, regTouched.email)} />
                    {regTouched.email && !regErrors.email && regForm.email && <CheckCircle size={14} className="absolute right-3 top-3 text-green-500" />}
                  </div>
                  {regTouched.email && regErrors.email && <p className="text-red-400 text-xs mt-0.5">{regErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className={label}>Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input type={showRegPassword ? 'text' : 'password'} name="password"
                      placeholder="Min 6 chars, letters & numbers"
                      value={regForm.password} onChange={handleRegChange} onBlur={handleRegBlur}
                      className={getInputClass(regErrors.password, regTouched.password)}
                      style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200">
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {regForm.password && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength?.color} ${strength?.width}`} />
                      </div>
                      <p className={`text-xs mt-0.5 font-medium ${strength?.text}`}>Strength: {strength?.label}</p>
                    </div>
                  )}
                  {regTouched.password && regErrors.password && <p className="text-red-400 text-xs mt-0.5">{regErrors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={label}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={regForm.confirmPassword} onChange={handleRegChange} onBlur={handleRegBlur}
                      className={getInputClass(regErrors.confirmPassword, regTouched.confirmPassword)}
                      style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {regTouched.confirmPassword && regErrors.confirmPassword && <p className="text-red-400 text-xs mt-0.5">{regErrors.confirmPassword}</p>}
                  {regTouched.confirmPassword && !regErrors.confirmPassword && regForm.confirmPassword && (
                    <p className="text-green-400 text-xs mt-0.5 flex items-center space-x-1"><CheckCircle size={11} /><span>Passwords match!</span></p>
                  )}
                </div>

                {/* Enrollment — students only */}
                {regForm.role === 'student' && (
                  <div>
                    <label className={label}>Enrollment Number</label>
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input type="text" name="enrollmentNumber" placeholder="e.g. EN2024001"
                        value={regForm.enrollmentNumber} onChange={handleRegChange} onBlur={handleRegBlur}
                        className={getInputClass(regErrors.enrollmentNumber, regTouched.enrollmentNumber)} />
                      {regTouched.enrollmentNumber && !regErrors.enrollmentNumber && regForm.enrollmentNumber && <CheckCircle size={14} className="absolute right-3 top-3 text-green-500" />}
                    </div>
                    {regTouched.enrollmentNumber && regErrors.enrollmentNumber && <p className="text-red-400 text-xs mt-0.5">{regErrors.enrollmentNumber}</p>}
                  </div>
                )}

                {/* Department */}
                <div>
                  <label className={label}>Department</label>
                  <div className="relative">
                    <BookOpen size={14} className="absolute left-3 top-3 text-gray-400" />
                    <select name="department" value={regForm.department}
                      onChange={handleRegChange} onBlur={handleRegBlur}
                      className={getInputClass(regErrors.department, regTouched.department)}>
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  {regTouched.department && regErrors.department && <p className="text-red-400 text-xs mt-0.5">{regErrors.department}</p>}
                </div>

                {/* Secret Key — admin and professor only */}
                {(regForm.role === 'admin' || regForm.role === 'professor') && (
                  <div>
                    <label className={label}>
                      {regForm.role === 'admin' ? 'Admin' : 'Professor'} Secret Key
                    </label>
                    <div className="relative">
                      <Key size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input type="password" name="secretKey"
                        placeholder={`Enter ${regForm.role} secret key`}
                        value={regForm.secretKey} onChange={handleRegChange} onBlur={handleRegBlur}
                        className={getInputClass(regErrors.secretKey, regTouched.secretKey)} />
                    </div>
                    {regTouched.secretKey && regErrors.secretKey && <p className="text-red-400 text-xs mt-0.5">{regErrors.secretKey}</p>}
                    <p className="text-yellow-400 text-xs mt-1">⚠️ Contact administration for the secret key</p>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={regLoading}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition duration-200 mt-1 ${
                    isRegValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}>
                  {regLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Creating Account...</span>
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
