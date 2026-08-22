import React from 'react';
import { Logo } from '../common/Logo';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5E5E5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" />
            <p className="text-xs text-[#666666] max-w-xs leading-relaxed">
              Personalized interview preparation for the modern candidate.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li>
                <a href="#features" className="hover:text-[#111111] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#111111] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#111111] transition-colors">
                  Resume Analysis
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#111111] transition-colors">
                  Voice Interviewer
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li>
                <a href="#about" className="hover:text-[#111111] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#111111] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#111111] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#111111] transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li>
                <Link to="/login" className="hover:text-[#111111] transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#111111] transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#111111] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <p>© 2026 InterviewPro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
