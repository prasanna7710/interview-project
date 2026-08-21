import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { GoogleAuthButton } from '../components/common/GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      login(res.data.token, res.data.user);
      showToast('Account created successfully! Welcome to Interview Pro AI.', 'success');
      navigate('/resume');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Email might already exist.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block">
          <Logo size="lg" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-200 shadow-card space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <GoogleAuthButton label="Sign up with Google" redirectTo="/resume" />

          <div className="space-y-2 pt-2 text-xs text-gray-500 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span>Resume analysis & personalized question engine included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span>Voice speech-to-text & interviewer voice enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
