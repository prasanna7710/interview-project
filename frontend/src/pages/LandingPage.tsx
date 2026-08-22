import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { GoogleAuthButton } from '../components/common/GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-brand-100 selection:text-brand-700">
      {/* Minimal Header */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <div>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition py-2 px-3"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Authentication Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          
          {/* Header Branding & Taglines */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 mb-1">
              <span className="font-extrabold text-xl tracking-tight">IP</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              InterviewPro AI
            </h1>

            <p className="text-sm sm:text-base font-semibold text-brand-600">
              Practice smarter. Interview better.
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Upload your resume, practice personalized interviews, and improve your interview performance with intelligent feedback.
            </p>
          </div>

          {/* Authentication Options Box */}
          <div className="pt-2 space-y-3.5">
            {/* Google Authentication Integration */}
            <GoogleAuthButton label="Continue with Google" redirectTo="/dashboard" />

            {/* Email Authentication Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                Log In
              </Link>
              
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-2xs active:scale-[0.99]"
              >
                Create Account
              </Link>
            </div>

            {/* Authenticated user direct shortcut */}
            {isAuthenticated && (
              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Continue as {user?.fullName || user?.email || 'User'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Professional Bottom Line */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500">
              Personalized interview practice based on your resume.
            </p>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        © {new Date().getFullYear()} InterviewPro AI. All rights reserved.
      </footer>
    </div>
  );
};
