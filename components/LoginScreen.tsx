
import React, { useState } from 'react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  users: User[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToSignUp, onSwitchToForgotPassword, users }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const lowercasedIdentifier = identifier.toLowerCase();
    const user = users.find(u => 
        u.username.toLowerCase() === lowercasedIdentifier ||
        u.email.toLowerCase() === lowercasedIdentifier ||
        u.phoneNumber === identifier
    );

    // Mock authentication: any existing user with password 'password123'
    if (user && password === 'password123') {
        if (user.isBlocked) {
            setError('This account has been blocked.');
            return;
        }
        onLogin(user);
    } else {
      setError('Invalid credentials or password.');
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">AMScout</h1>
          <p className="text-gray-300 mt-2 drop-shadow-sm">Sign in to continue</p>
      </div>

      <form onSubmit={handleLogin} className="bg-zinc-800/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-900/10 rounded-2xl p-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-200 block mb-2">Username, Email, or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
              placeholder="e.g., Aria or aria@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-200 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
              placeholder="•••••••• (use 'password123')"
            />
          </div>
        </div>
        
        <div className="text-right -mt-2">
            <button type="button" onClick={onSwitchToForgotPassword} className="text-xs text-blue-300 hover:underline font-semibold">
                Forgot Password?
            </button>
        </div>

        {error && <p className="text-red-300 text-xs text-center bg-red-500/20 p-2 rounded-md border border-red-500/30">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-gray-300 mt-6">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className="font-semibold text-blue-300 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;