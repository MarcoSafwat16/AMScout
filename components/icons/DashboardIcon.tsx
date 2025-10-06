
import React from 'react';

const DashboardIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.554-.225a2.25 2.25 0 012.121 0l.554.225c.55.219 1.02.684 1.11 1.226l.099.542a2.25 2.25 0 01-1.214 2.474l-.611.306a2.25 2.25 0 00-1.214 2.474l.099.542c.09.542.56 1.007 1.11 1.226l.554.225a2.25 2.25 0 012.121 0l.554-.225c.55-.219 1.02-.684 1.11-1.226l.099-.542a2.25 2.25 0 011.214-2.474l.611-.306a2.25 2.25 0 001.214-2.474l-.099-.542a2.25 2.25 0 00-1.11-1.226l-.554-.225a2.25 2.25 0 00-2.121 0l-.554.225a2.25 2.25 0 01-1.11 1.226l-.099.542a2.25 2.25 0 01-1.214 2.474l-.611.306a2.25 2.25 0 00-1.214 2.474l.099.542c.09.542.56 1.007 1.11 1.226l.554.225a2.25 2.25 0 012.121 0l.554-.225c.55-.219 1.02-.684 1.11-1.226" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.47-2.47m0 0l-2.47 2.47m2.47-2.47V3.75m0 0l-2.47 2.47M13.28 6.22l2.47-2.47" />
    <path d="M9 15.75l-2.47-2.47m0 0l-2.47 2.47m2.47-2.47V3.75m0 0l2.47 2.47M9 6.22l-2.47-2.47" />
  </svg>
);
export default DashboardIcon;
