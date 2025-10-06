
import React from 'react';

const CoinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-4H9.401M15 12h-3m-3.599-1a2.001 2.001 0 00-1.2 3.799m1.2-3.799A2.001 2.001 0 0112 8m0 4a2.001 2.001 0 001.2-3.799m-1.2 3.799A2.001 2.001 0 0112 16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
export default CoinIcon;
