import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white p-2 shadow-sm">
        <Bot className={iconSizes[size]} />
        <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-gray-900 ${textSizes[size]}`}>
            Interview<span className="text-brand-600">Pro</span> <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-semibold border border-brand-200 uppercase tracking-wider ml-0.5">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
