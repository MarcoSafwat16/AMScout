
import React from 'react';

const TagIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className, filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.95 16.65a3.5 3.5 0 00-4.95 0L14 17.7l-1-1 .05-.05a3.5 3.5 0 00-4.95-4.95L3 16.75V21h4.25l4.9-4.9a3.5 3.5 0 000-4.95z" />
  </svg>
);
export default TagIcon;
