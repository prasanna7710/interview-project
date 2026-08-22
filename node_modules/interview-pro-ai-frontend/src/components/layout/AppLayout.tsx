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
    <div className="flex min-h-screen bg-[#FAFAFA] text-[#111111] font-sans antialiased selection:bg-[#2563EB]/10 selection:text-[#2563EB]">
      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-[#666666] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              {title && <h1 className="text-lg font-bold text-[#111111] tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-[#666666] hover:text-[#111111] p-2 rounded-lg hover:bg-[#F5F5F5] relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full" />
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors border border-transparent hover:border-[#E5E5E5]"
            >
              <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden flex-shrink-0">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user?.fullName || 'Avatar'} className="w-full h-full object-cover" />
                ) : user?.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[#111111]">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Application Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
