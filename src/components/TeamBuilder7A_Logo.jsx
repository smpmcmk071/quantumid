import React from 'react';

export default function TeamBuilder7A_Logo({ size = 'md', showText = false }) {
  const sizes = {
    sm: { height: 'h-8' },
    md: { height: 'h-12' },
    lg: { height: 'h-16' }
  };
  
  const s = sizes[size];
  
  return (
    <div className="flex items-center">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ca5137f399439dd98a642/81f88cbf2_image.png" 
        alt="TeamBuilder7A" 
        className={`${s.height} w-auto`}
      />
    </div>
  );
}