import React from 'react';
import { Terminal } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2 select-none group">
      <div className="flex items-center justify-center rounded-lg bg-[#111111] text-white p-1.5 border border-[#222222] shadow-2xs group-hover:bg-black transition-colors">
        <Terminal className={iconSizes[size]} />
      </div>
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-[#111111] ${textSizes[size]}`}>
            Interview<span className="text-[#2563EB]">Pro</span>
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
            AI
          </span>
        </div>
      )}
    </div>
  );
};
