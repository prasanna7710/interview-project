import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, ArrowRight, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition">How It Works</a>
            <a href="#about" className="hover:text-brand-600 transition">About</a>
          </div>

          {/* Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 shadow-xs hover:shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#64748B] hover:text-[#2563EB] text-sm font-semibold px-3 py-2 transition-all duration-150"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white px-4.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-brand-600 py-2 text-base font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-brand-600 py-2 text-base font-medium"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-brand-600 py-2 text-base font-medium"
          >
            About
          </a>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-brand-600 text-white py-2.5 rounded-lg font-medium text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-gray-700 border border-gray-300 py-2.5 rounded-lg font-medium text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-brand-600 text-white py-2.5 rounded-lg font-medium text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
