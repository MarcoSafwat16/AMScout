
import React, { useMemo } from 'react';
import { UserStories, User } from '../types';
import CrownIcon from './icons/CrownIcon';

interface StoryTrayProps {
  userStories: UserStories[];
  onViewStories: (userStories: UserStories) => void;
  currentUser: User;
  onAddStory: () => void;
  topUsers: string[];
}

const StoryTray: React.FC<StoryTrayProps> = ({ userStories, onViewStories, currentUser, onAddStory, topUsers }) => {
  const sortedStories = useMemo(() => {
    return [...userStories].sort((a, b) => {
        if (a.hasUnseen && !b.hasUnseen) return -1;
        if (!a.hasUnseen && b.hasUnseen) return 1;
        return 0; // Maintain original order otherwise
      });
  }, [userStories]);

  const isTopUser = (userId: string) => topUsers.includes(userId);

  return (
    <div className="px-4 py-3 border-b border-gray-800/60">
      <div className="flex space-x-4 overflow-x-auto pb-1 no-scrollbar">
        {/* "Add Story" button using current user's avatar */}
        <button
          onClick={onAddStory}
          className="flex-shrink-0 text-center group"
          aria-label="Add to your story"
        >
          <div className="relative w-16 h-16">
            <img 
              src={currentUser.avatarUrl} 
              alt="Your Story" 
              className="w-16 h-16 rounded-full object-cover bg-zinc-800"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#0c3a99] rounded-full flex items-center justify-center border-2 border-[#1C1C1E]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-300 font-medium mt-1.5 truncate w-16">
            Your Story
          </p>
        </button>

        {/* Other users' stories */}
        {sortedStories.map(storyGroup => (
          <button
            key={storyGroup.user.id}
            className="flex-shrink-0 text-center group"
            onClick={() => onViewStories(storyGroup)}
          >
            <div className={`w-16 h-16 p-0.5 rounded-full flex items-center justify-center relative ${storyGroup.hasUnseen ? 'bg-gradient-to-tr from-sky-400 via-blue-500 to-[#0c3a99]' : 'bg-zinc-700'}`}>
              <div className="bg-[#1C1C1E] p-0.5 rounded-full w-full h-full">
                 <img src={storyGroup.user.avatarUrl} alt={storyGroup.user.username} className="w-full h-full object-cover rounded-full" />
              </div>
              {isTopUser(storyGroup.user.id) && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full border-2 border-black">
                  <CrownIcon className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-300 font-medium mt-1.5 truncate w-16">
              {storyGroup.user.username}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoryTray;