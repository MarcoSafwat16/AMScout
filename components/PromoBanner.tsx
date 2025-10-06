import React from 'react';
import AnnouncementIcon from './icons/AnnouncementIcon';

interface PromoBannerProps {
  text: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ text }) => {
  // We duplicate the text to create a seamless loop for the marquee effect.
  const bannerText = `${text} `; 

  return (
    <div className="bg-zinc-800 border-b border-zinc-700 flex items-center gap-3 overflow-hidden text-sm font-medium text-gray-300 py-2 px-3">
      <AnnouncementIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
      <div className="flex-1 whitespace-nowrap overflow-hidden">
        <span className="animate-marquee inline-block">
          {bannerText}
        </span>
        <span className="animate-marquee inline-block" aria-hidden="true">
          {bannerText}
        </span>
      </div>
    </div>
  );
};

export default PromoBanner;