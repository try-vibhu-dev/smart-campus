import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { User, Mail, Lock, Hash, BookOpen, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', enrollmentNumber: '', department: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const validate = (field, value) => {
    let error = '';
    if (field === 'name') {
      if (!value) error = 'Full name is required';
      else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name must contain only letters';
      else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
    }
    if (field === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^[a-zA-Z]/.test(value)) error = 'Email must start with a letter';
      else if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = 'Enter a valid email address';
    }
    if (field === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
      else if (!/[a-zA-Z]/.test(value)) error = 'Password must contain at least one letter';
      else if (!/[0-9]/.test(value)) error = 'Password must contain at least one number';
    }
    if (field === 'confirmPassword') {
      if (!value) error = 'Please confirm your password';
      else if (value !== form.password) error = 'Passwords do not match';
    }
    if (field === 'enrollmentNumber' && form.role === 'student') {
      if (!value) error = 'Enrollment number is required';
      else if (!/^[A-Za-z0-9]+$/.test(value)) error = 'No special characters allowed';
    }
    if (field === 'department') {
      if (!value) error = 'Department is required';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validate(name, value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validate(name, value) });
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    if (form.role === 'student') requiredFields.push('enrollmentNumber');
    return requiredFields.every(f => form[f] && !validate(f, form[f]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    if (form.role === 'student') fields.push('enrollmentNumber');
    const allTouched = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
    const allErrors = fields.reduce((acc, f) => ({ ...acc, [f]: validate(f, form[f]) }), {});
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true);
    setServerError('');
    try {
      await API.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const getInputClass = (field) => {
    const base = "w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none transition duration-200 text-sm";
    if (!touched[field]) return `${base} border-gray-600 focus:border-blue-500`;
    if (errors[field]) return `${base} border-red-500 focus:border-red-500`;
    return `${base} border-green-500 focus:border-green-500`;
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SC</span>
          </div>
          <h1 className="text-white text-3xl font-bold">Create Account</h1>
          <p className="text-gray-400 mt-2 text-sm">Join Smart Campus today</p>
        </div>

        {serverError && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span className="text-sm">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Role Selector */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            <button type="button" onClick={() => setForm({ ...form, role: 'student' })}
              className={`flex-1 py-2.5 text-sm font-medium transition duration-200 ${form.role === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              Student
            </button>
            <button type="button" onClick={() => setForm({ ...form, role: 'admin' })}
              className={`flex-1 py-2.5 text-sm font-medium transition duration-200 ${form.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              Admin
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input type="text" name="name" placeholder="Vaibhav Dwivedi"
                value={form.name} onChange={handleChange} onBlur={handleBlur}
                className={getInputClass('name')} />
              {touched.name && !errors.name && form.name && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
              {touched.name && errors.name && <AlertCircle size={16} className="absolute right-3 top-3.5 text-red-500" />}
            </div>
            {touched.name && errors.name && (
              <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.name}</span></p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input type="email" name="email" placeholder="yourname@gmail.com"
                value={form.email} onChange={handleChange} onBlur={handleBlur}
                className={getInputClass('email')} />
              {touched.email && !errors.email && form.email && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
              {touched.email && errors.email && <AlertCircle size={16} className="absolute right-3 top-3.5 text-red-500" />}
            </div>
            {touched.email && errors.email && (
              <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.email}</span></p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 chars, letters & numbers"
                value={form.password} onChange={handleChange} onBlur={handleBlur}
                className={getInputClass('password')} style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength?.color} ${strength?.width}`} />
                </div>
                <p className={`text-xs mt-1 ${strength?.color.replace('bg-', 'text-')}`}>
                  Strength: {strength?.label}
                </p>
              </div>
            )}
            {touched.password && errors.password && (
              <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.password}</span></p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                className={getInputClass('confirmPassword')} style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.confirmPassword}</span></p>
            )}
            {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
              <p className="text-green-400 text-xs mt-1 flex items-center space-x-1"><CheckCircle size={12} /><span>Passwords match!</span></p>
            )}
          </div>

          {/* Enrollment (students only) */}
          {form.role === 'student' && (
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1.5">Enrollment Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="text" name="enrollmentNumber" placeholder="e.g. EN2024001"
                  value={form.enrollmentNumber} onChange={handleChange} onBlur={handleBlur}
                  className={getInputClass('enrollmentNumber')} />
                {touched.enrollmentNumber && !errors.enrollmentNumber && form.enrollmentNumber && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
                {touched.enrollmentNumber && errors.enrollmentNumber && <AlertCircle size={16} className="absolute right-3 top-3.5 text-red-500" />}
              </div>
              {touched.enrollmentNumber && errors.enrollmentNumber && (
                <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.enrollmentNumber}</span></p>
              )}
            </div>
          )}

          {/* Department */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Department</label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <select name="department" value={form.department}
                onChange={handleChange} onBlur={handleBlur}
                className={getInputClass('department')}>
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            {touched.department && errors.department && (
              <p className="text-red-400 text-xs mt-1 flex items-center space-x-1"><AlertCircle size={12} /><span>{errors.department}</span></p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-sm transition duration-200 mt-2 ${
              isFormValid() ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}>
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span>Creating Account...</span>
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;