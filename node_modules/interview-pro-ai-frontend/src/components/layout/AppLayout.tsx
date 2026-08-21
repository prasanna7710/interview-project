import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F0F7FF]">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              {title && <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 relative transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden flex-shrink-0">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user?.fullName || 'Avatar'} className="w-full h-full object-cover" />
                ) : user?.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-gray-700">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
