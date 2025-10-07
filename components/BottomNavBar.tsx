import React from 'react';
import { Page, User } from '../types';
import HomeIcon from './icons/HomeIcon';
import ReelsIcon from './icons/ReelsIcon';
import MessageIcon from './icons/MessageIcon';
import ProfileIcon from './icons/ProfileIcon';
import AddIcon from './icons/AddIcon';
import ShopIcon from './icons/ShopIcon';
import SearchIcon from './icons/SearchIcon';

// Fix: Moved BellIcon definition before its usage.
const BellIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

interface AppNavBarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onComposeClick: () => void;
  currentUser: User;
}

interface NavItem {
  page: Page;
  label: string;
  Icon: React.FC<{ className?: string; filled: boolean }>;
}

const navItems: NavItem[] = [
  { page: Page.Home, label: 'Home', Icon: HomeIcon },
  { page: Page.Search, label: 'Search', Icon: SearchIcon },
  { page: Page.Reels, label: 'Reels', Icon: ReelsIcon },
  { page: Page.Shop, label: 'AMS Shop', Icon: ShopIcon },
  { page: Page.Messages, label: 'AMS Chat', Icon: MessageIcon },
  { page: Page.Notifications, label: 'Notifications', Icon: BellIcon },
  { page: Page.Profile, label: 'Profile', Icon: ProfileIcon },
];

const MobileNavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={item.label}
    className={`flex items-center justify-center h-12 rounded-full transition-all duration-300 ease-in-out ${
      isActive ? 'bg-[#3A3A3C] px-4' : 'w-12 hover:bg-gray-800'
    }`}
  >
    <div className="flex items-center">
      <item.Icon
        className={`h-6 w-6 flex-shrink-0 transition-colors ${
          isActive ? 'text-white' : 'text-gray-400'
        }`}
        filled={isActive}
      />
      {isActive && (
        <span className="ml-2 text-sm font-semibold text-white whitespace-nowrap">
          {item.label}
        </span>
      )}
    </div>
  </button>
);

const DesktopNavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={item.label}
    className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-zinc-700 font-bold' : 'hover:bg-zinc-800'
    }`}
  >
    <item.Icon className="h-6 w-6 flex-shrink-0" filled={isActive} />
    <span className="ml-4 text-base">{item.label}</span>
  </button>
);

const AppNavBar: React.FC<AppNavBarProps> = ({ activePage, setActivePage, onComposeClick, currentUser }) => {
  return (
    <>
      {/* --- Mobile Bottom Nav Bar --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="max-w-lg mx-auto p-4 flex justify-center items-center relative">
          <nav className="bg-[#2C2C2E]/80 backdrop-blur-lg border border-white/10 rounded-full flex items-center p-1 space-x-1 shadow-lg">
            {navItems.filter(i => i.page !== Page.Search && i.page !== Page.Notifications).map((item) => (
              <MobileNavButton
                key={item.page}
                item={item}
                isActive={activePage === item.page}
                onClick={() => setActivePage(item.page)}
              />
            ))}
          </nav>

          <button
            onClick={onComposeClick}
            aria-label="Create new content"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0c3a99] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#1049b8] active:bg-[#092c73] transition-all transform hover:scale-105 active:scale-95"
          >
            <AddIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-4 border-r border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-100 mb-8">AMScout</h1>
        <nav className="flex flex-col space-y-2">
            {navItems.map(item => (
                <DesktopNavButton 
                    key={item.page}
                    item={item}
                    isActive={activePage === item.page}
                    onClick={() => setActivePage(item.page)}
                />
            ))}
        </nav>
        <button
            onClick={onComposeClick}
            className="w-full mt-6 bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-3 rounded-full transition-colors"
        >
            Create
        </button>
        <div className="mt-auto flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800">
            <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-sm">{currentUser.username}</p>
                <p className="text-xs text-gray-400">@{currentUser.username.toLowerCase()}</p>
            </div>
        </div>
      </aside>
    </>
  );
};

export default AppNavBar;
