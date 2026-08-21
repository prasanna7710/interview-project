import React from 'react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-gray-500 max-w-sm">
              Practice smarter. Interview better. Get hired. Empowering students and job seekers with personalized AI mock interviews.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="#features" className="hover:text-brand-600 transition">Resume Analysis</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition">AI Follow-ups</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition">Voice Interviewer</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition">Scoring Rubric</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="#" className="hover:text-brand-600 transition">Interview Questions Guide</a></li>
              <li><a href="#" className="hover:text-brand-600 transition">STAR Method Template</a></li>
              <li><a href="#" className="hover:text-brand-600 transition">Resume Optimization Tips</a></li>
              <li><a href="#" className="hover:text-brand-600 transition">System Architecture</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="/login" className="hover:text-brand-600 transition">Sign In</a></li>
              <li><a href="/register" className="hover:text-brand-600 transition">Create Account</a></li>
              <li><a href="/dashboard" className="hover:text-brand-600 transition">Dashboard</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Interview Pro AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
            <a href="#" className="hover:text-gray-700">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
