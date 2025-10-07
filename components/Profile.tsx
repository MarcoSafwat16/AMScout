import React, { useState, useMemo } from 'react';
import { User, Post as PostType } from '../types';
import PostComponent from './Post';
import TagIcon from './icons/TagIcon';
import ReelsIcon from './icons/ReelsIcon';
import CrownIcon from './icons/CrownIcon';

// --- Helper Icons for Profile Page ---
const AllPostsIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill={filled ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM20 3h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM10 13H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zM20 13h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z" />
  </svg>
);
const PhotoIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill={filled ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 13.5l2.5-2.5a1.5 1.5 0 0 1 2 0l3 3a1.5 1.5 0 0 0 2 0l2.5-2.5" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
);
// --- End Helper Icons ---

const Profile: React.FC<{
  users: User[];
  posts: PostType[];
  viewedProfileId: string | null;
  currentUser: User;
  onGoBack: () => void;
  onViewProfile: (userId: string) => void;
  onCommentClick: (post: PostType) => void;
  onRepost: (post: PostType) => void;
  onToggleFollow: (userId: string) => void;
  topUsers: string[];
  onLogout: () => void;
  onEditProfile: () => void;
}> = ({ users, posts, viewedProfileId, currentUser, onGoBack, onViewProfile, onCommentClick, onRepost, onToggleFollow, topUsers, onLogout, onEditProfile }) => {
  const [activeTab, setActiveTab] = useState('all');
  const currentUserId = currentUser.id;
  
  const userToDisplay = useMemo(() => {
    const profileId = viewedProfileId || currentUserId;
    return users.find(u => u.id === profileId) || null;
  }, [viewedProfileId, currentUserId, users]);
  
  const creatorRank = useMemo(() => {
    if (!userToDisplay) return null;
    const rank = topUsers.indexOf(userToDisplay.id);
    return rank !== -1 ? rank + 1 : null;
  }, [userToDisplay, topUsers]);

  const { followerCount, followingCount, postCount } = useMemo(() => {
    if (!userToDisplay) return { followerCount: 0, followingCount: 0, postCount: 0 };
    
    const followers = users.filter(u => u.following?.includes(userToDisplay.id)).length;
    const following = userToDisplay.following?.length || 0;
    
    const userPosts = posts.filter(p => p.author.id === userToDisplay.id);
    const pCount = userPosts.length;

    return { 
        followerCount: followers, 
        followingCount: following, 
        postCount: pCount, 
    };
  }, [userToDisplay, posts, users]);

  const filteredPosts = useMemo(() => {
    if (!userToDisplay) return [];

    if (activeTab === 'tagged') {
        return posts.filter(p => {
          const isTaggedInPost = p.taggedUsers?.some(u => u.id === userToDisplay.id);
          const isTaggedInOriginalPost = p.originalPost?.taggedUsers?.some(u => u.id === userToDisplay.id);
          return isTaggedInPost || isTaggedInOriginalPost;
        });
    }

    const userPosts = posts.filter(p => p.author.id === userToDisplay.id || (p.originalPost && p.originalPost.author.id === userToDisplay.id));
    
    switch (activeTab) {
      case 'photos':
        return userPosts.filter(p => {
          const postToCheck = p.originalPost || p;
          return postToCheck.type !== 'reel' && !!postToCheck.imageUrl;
        });
      case 'reels':
        return userPosts.filter(p => (p.originalPost || p).type === 'reel');
      case 'all':
      default:
        return userPosts;
    }
  }, [posts, userToDisplay, activeTab]);

  if (!userToDisplay) {
    return <div className="p-4 text-center text-gray-400">User not found.</div>;
  }
  
  const isCurrentUser = userToDisplay.id === currentUserId;
  const isFollowing = currentUser.following?.includes(userToDisplay.id);
  
  const formatStat = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="w-full bg-[#1C1C1E] text-gray-200 min-h-screen">
      <header className="p-4 flex justify-between items-center md:hidden">
        <button onClick={onGoBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold">{userToDisplay.username}</h1>
        <button>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
           </svg>
        </button>
      </header>
      
      <div className="p-4">
        <div className="bg-[#2C2C2E]/60 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <img src={userToDisplay.avatarUrl} alt={userToDisplay.username} className="w-20 h-20 rounded-full object-cover bg-gray-700 flex-shrink-0" />
            <div className="flex-grow">
              <h2 className="text-lg font-bold">{userToDisplay.fullName}</h2>
              <p className="text-sm text-gray-400">@{userToDisplay.username.toLowerCase()}</p>
              {creatorRank && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 font-bold text-xs px-2 py-1 rounded-full">
                  <CrownIcon className="w-3.5 h-3.5" />
                  <span>#{creatorRank} Creator</span>
                </div>
              )}
            </div>
          </div>
          
          {userToDisplay.bio && (
            <p className="text-sm text-center text-gray-300 my-4 whitespace-pre-wrap">{userToDisplay.bio}</p>
          )}

          <div className="flex justify-around text-center pt-4 mt-4 border-t border-gray-700/60">
              <div><span className="font-bold text-base">{formatStat(postCount)}</span><p className="text-xs text-gray-400">Posts</p></div>
              <div><span className="font-bold text-base">{formatStat(followerCount)}</span><p className="text-xs text-gray-400">Followers</p></div>
              <div><span className="font-bold text-base">{formatStat(followingCount)}</span><p className="text-xs text-gray-400">Following</p></div>
              <div><span className="font-bold text-base">{formatStat(userToDisplay.points || 0)}</span><p className="text-xs text-gray-400">Points</p></div>
          </div>
        </div>
      </div>


       <div className="px-4 flex gap-2">
        {isCurrentUser ? (
          <>
            <button onClick={onEditProfile} className="flex-1 bg-gray-700/80 text-white font-semibold py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              Edit Profile
            </button>
             <button onClick={onLogout} className="flex-1 bg-red-800/80 text-white font-semibold py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onToggleFollow(userToDisplay.id)} className={`flex-1 font-semibold py-1.5 rounded-lg text-sm transition-colors ${isFollowing ? 'bg-gray-700/80 text-white hover:bg-gray-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="flex-1 bg-gray-700/80 text-white font-semibold py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Message
            </button>
          </>
        )}
      </div>

      <nav className="flex justify-around border-y border-gray-700/60 mt-4">
          <button className={`p-3 w-full ${activeTab === 'all' ? 'border-b-2 border-white' : ''}`} onClick={() => setActiveTab('all')}>
            <AllPostsIcon className="h-6 w-6 mx-auto text-gray-300" filled={activeTab === 'all'} />
          </button>
          <button className={`p-3 w-full ${activeTab === 'photos' ? 'border-b-2 border-white' : ''}`} onClick={() => setActiveTab('photos')}>
            <PhotoIcon className="h-6 w-6 mx-auto text-gray-300" filled={activeTab === 'photos'} />
          </button>
          <button className={`p-3 w-full ${activeTab === 'reels' ? 'border-b-2 border-white' : ''}`} onClick={() => setActiveTab('reels')}>
            <ReelsIcon className="h-6 w-6 mx-auto text-gray-300" filled={activeTab === 'reels'} />
          </button>
           <button className={`p-3 w-full ${activeTab === 'tagged' ? 'border-b-2 border-white' : ''}`} onClick={() => setActiveTab('tagged')}>
            <TagIcon className="h-6 w-6 mx-auto text-gray-300" filled={activeTab === 'tagged'} />
          </button>
      </nav>

      <div className="p-1">
        {filteredPosts.length > 0 ? (
           <div className="flex flex-col">
            {filteredPosts.map(post => (
              <PostComponent
                key={post.id} 
                post={post} 
                onViewProfile={onViewProfile} 
                currentUser={currentUser}
                onCommentClick={onCommentClick}
                onRepost={onRepost}
                onToggleFollow={onToggleFollow}
                topUsers={topUsers}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="font-semibold">No content yet</p>
            <p className="text-sm">This user hasn't posted anything in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;