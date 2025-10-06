
import React, { useState } from 'react';
import { User } from '../types';

interface SignUpScreenProps {
  onSignUp: (userData: Omit<User, 'id' | 'avatarUrl' | 'points' | 'isAdmin'>) => void;
  onSwitchToLogin: () => void;
  users: User[];
}

const TEAMS = {
    'cubs': 'اشبال',
    'brownies': 'زهرات',
    'scouts': 'كشافة',
    'guides': 'مرشدات',
    'venturers': 'متقدم',
    'rangers': 'رائدات',
    'rovers': 'جوالة',
    'leaders': 'قاده'
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSwitchToLogin, users }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: 'male' as 'male' | 'female',
    team: 'cubs' as User['team'],
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
        case 'fullName':
            if (value.trim().length < 3) error = "Full name must be at least 3 characters.";
            break;
        case 'username':
            if (value.length < 3) error = "Username must be at least 3 characters.";
            else if (users.some(u => u.username.toLowerCase() === value.toLowerCase())) error = "Username is already taken.";
            break;
        case 'email':
            if (!/\S+@\S+\.\S+/.test(value)) error = "Please enter a valid email address.";
            else if (users.some(u => u.email.toLowerCase() === value.toLowerCase())) error = "Email is already in use.";
            break;
        case 'password':
            if (value.length < 8) error = "Password must be at least 8 characters.";
            break;
        case 'confirmPassword':
            if (value !== formData.password) error = "Passwords do not match.";
            break;
        case 'phoneNumber':
            if (!/^\d{10,15}$/.test(value)) error = "Please enter a valid phone number (10-15 digits).";
            break;
        case 'dateOfBirth':
            if (!value) error = "Please enter your date of birth.";
            break;
        default:
            break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    if (name === 'password') {
        const confirmError = validateField('confirmPassword', formData.confirmPassword);
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const isFormValid = () => {
    for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if(error) return false;
        }
    }
    return true;
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    let formIsValid = true;
    for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) {
                newErrors[key] = error;
                formIsValid = false;
            }
        }
    }
    setErrors(newErrors);

    if (formIsValid) {
      const { confirmPassword, ...userData } = formData;
      onSignUp(userData);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Create Account</h1>
          <p className="text-gray-300 mt-2 drop-shadow-sm">Join the AMScout community</p>
      </div>

      <form onSubmit={handleSignUp} className="bg-zinc-800/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-900/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.fullName && <p className="text-red-300 text-xs mt-1">{errors.fullName}</p>}
              </div>
               <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.username && <p className="text-red-300 text-xs mt-1">{errors.username}</p>}
              </div>
          </div>
          
          <div>
              <label className="text-sm font-bold text-gray-200 block mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
              {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.confirmPassword && <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.dateOfBirth && <p className="text-red-300 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                  {errors.phoneNumber && <p className="text-red-300 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Gender</label>
                  <div className="flex gap-4 mt-2 text-gray-200">
                      <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="form-radio bg-black/20 border-white/20 text-blue-500 focus:ring-blue-500"/>
                          Male
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="form-radio bg-black/20 border-white/20 text-pink-500 focus:ring-pink-500"/>
                          Female
                      </label>
                  </div>
              </div>
              <div>
                  <label className="text-sm font-bold text-gray-200 block mb-1">Team</label>
                  <select name="team" value={formData.team} onChange={handleChange} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none" required>
                      {Object.entries(TEAMS).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                      ))}
                  </select>
              </div>
          </div>
        </div>
        <button type="submit" className="w-full bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-2.5 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-6">
          Sign Up
        </button>
      </form>

      <p className="text-center text-sm text-gray-300 mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-blue-300 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignUpScreen;