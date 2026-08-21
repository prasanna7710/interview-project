import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { GoogleAuthButton } from '../components/common/GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      showToast('Welcome back to Interview Pro AI!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
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
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
        <p className="text-sm text-gray-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            create a new account for free
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
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700 font-medium select-none">
                Remember session for 7 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <GoogleAuthButton label="Continue with Google" redirectTo="/dashboard" />

          {/* Quick Demo Hint */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              New candidate? Register above to immediately upload your resume and start practicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
