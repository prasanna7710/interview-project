import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, ArrowRight, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666666]">
            <a href="#features" className="hover:text-[#111111] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#111111] transition-colors">
              How It Works
            </a>
            <a href="#about" className="hover:text-[#111111] transition-colors">
              About
            </a>
          </div>

          {/* Right Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-2xs"
              >
                <UserIcon className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#666666] hover:text-[#111111] text-sm font-medium px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-black text-white px-4.5 py-2 rounded-lg text-sm font-medium transition-all shadow-2xs"
                >
                  Sign Up
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-black p-2 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E5E5] bg-white px-4 pt-3 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#666666] hover:text-[#111111] py-2 text-base font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#666666] hover:text-[#111111] py-2 text-base font-medium"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#666666] hover:text-[#111111] py-2 text-base font-medium"
          >
            About
          </a>
          <div className="pt-4 border-t border-[#E5E5E5] flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#111111] text-white py-2.5 rounded-lg font-medium text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-[#111111] border border-[#E5E5E5] py-2.5 rounded-lg font-medium text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#111111] text-white py-2.5 rounded-lg font-medium text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
