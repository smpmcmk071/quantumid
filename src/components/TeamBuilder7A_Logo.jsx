import React from 'react';
import { Users, Sparkles } from 'lucide-react';

export default function TeamBuilder7A_Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', container: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', container: 'gap-3' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl', container: 'gap-4' }
  };
  
  const s = sizes[size];
  
  return (
    <div className={`flex items-center ${s.container}`}>
      <div className="relative">
        <Users className={`${s.icon} text-blue-400`} />
        <Sparkles className={`${s.icon} text-amber-400 absolute -top-1 -right-1 w-4 h-4`} />
      </div>
      {showText && (
        <div>
          <span className={`${s.text} font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent`}>
            TeamBuilder7A
          </span>
        </div>
      )}
    </div>
  );
}