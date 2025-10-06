
import React, { useState } from 'react';
import { User } from '../types';

interface ForgotPasswordScreenProps {
  onSwitchToLogin: () => void;
  users: User[];
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onSwitchToLogin, users }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    // In a real app, you'd call an API here.
    // For security, we don't confirm if the email exists. We just show a generic success message.
    console.log(`Password reset requested for: ${email}`);
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="bg-zinc-800/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-900/10 rounded-2xl p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-gray-300 mt-2 text-sm">If an account with that email exists, we've sent a link to reset your password.</p>
            <button onClick={onSwitchToLogin} className="mt-6 w-full bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-2.5 rounded-lg transition-colors">
                Back to Sign In
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Reset Password</h1>
          <p className="text-gray-300 mt-2 drop-shadow-sm">Enter your email to get a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-800/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-900/10 rounded-2xl p-8 space-y-6">
        <div>
          <label className="text-sm font-bold text-gray-200 block mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
            placeholder="you@example.com"
            required
          />
        </div>
        
        {error && <p className="text-red-300 text-xs text-center bg-red-500/20 p-2 rounded-md border border-red-500/30">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Send Reset Link
        </button>
      </form>

      <p className="text-center text-sm text-gray-300 mt-6">
        Remembered your password?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-blue-300 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordScreen;