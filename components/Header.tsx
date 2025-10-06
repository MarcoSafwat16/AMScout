
import React from 'react';
import SearchIcon from './icons/SearchIcon';
import BellIcon from './icons/BellIcon';

interface HeaderProps {
  onNotificationClick: () => void;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, onSearchClick }) => {
  return (
    <header className="p-4 flex justify-between items-center bg-[#1C1C1E] border-b border-zinc-800 md:hidden">
      <h1 className="text-xl font-bold tracking-tight text-gray-100">
        AMScout
      </h1>
      <div className="flex items-center gap-2">
         <button 
          onClick={onSearchClick}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          title="Search"
        >
            <SearchIcon className="h-6 w-6 text-gray-300" />
        </button>
         <button 
          onClick={onNotificationClick}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          title="Notifications"
        >
            <BellIcon className="h-6 w-6 text-gray-300" filled={false}/>
        </button>
      </div>
    </header>
  );
};


const BellIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export default Header;