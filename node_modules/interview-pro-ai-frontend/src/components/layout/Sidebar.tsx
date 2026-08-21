import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Video,
  History,
  BarChart3,
  User,
  Settings,
  LogOut,
  Home,
  X,
  Code,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Resume', icon: FileText, to: '/resume' },
    { label: 'Start Interview', icon: Video, to: '/interview/setup' },
    { label: 'Coding Test', icon: Code, to: '/coding/setup' },
    { label: 'History', icon: History, to: '/history' },
    { label: 'Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Profile', icon: User, to: '/profile' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 select-none">
      {/* Header Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Logo size="md" />
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border-l-4 border-[#2563EB] shadow-xs pl-2.5'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Summary & Logout */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 overflow-hidden ring-2 ring-blue-100">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={user?.fullName || 'Avatar'} className="w-full h-full object-cover" />
            ) : user?.fullName ? (
              user.fullName.charAt(0).toUpperCase()
            ) : (
              'U'
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-[#0F172A] truncate">
              {user?.fullName || 'User'}
            </span>
            <span className="text-[11px] text-[#64748B] truncate">
              {user?.email || 'user@example.com'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 py-2 rounded-lg border border-red-200 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex-1 max-w-xs w-full bg-white z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
