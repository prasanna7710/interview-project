import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSentSuccess(true);
      showToast('Password reset instructions generated successfully.', 'success');
    } catch (err: any) {
      showToast('Failed to process request.', 'error');
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
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset your password</h2>
        <p className="text-sm text-gray-500">
          Enter your registered email address to receive reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-200 shadow-card space-y-6">
          {sentSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Check Your Email / Console</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                If an account exists for <span className="font-semibold text-gray-800">{email}</span>, password reset instructions have been generated.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Instructions...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
