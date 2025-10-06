
import React, { useState } from 'react';
import { Post, User } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import ShareIcon from './icons/ShareIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ReelsIcon from './icons/ReelsIcon';
import CrownIcon from './icons/CrownIcon';

interface PostProps {
  post: Post;
  onViewProfile: (userId: string) => void;
  currentUserId: string;
  onCommentClick: (post: Post) => void;
  onRepost: (post: Post) => void;
  followedUserIds: Set<string>;
  onToggleFollow: (userId: string) => void;
  topUsers: string[];
}

const TaggedUsersOverlay: React.FC<{ users: User[], onClick: () => void }> = ({ users, onClick }) => (
  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 cursor-pointer" onClick={onClick}>
    <h4 className="text-xs font-bold text-gray-300 mb-2">Tagged:</h4>
    <div className="flex flex-wrap gap-2">
      {users.map(user => (
        <span key={user.id} className="text-sm font-semibold bg-black/50 text-white px-2 py-1 rounded-md">
          @{user.username}
        </span>
      ))}
    </div>
  </div>
);

const PostMedia: React.FC<{ post: Post }> = ({ post }) => {
  const [showTags, setShowTags] = useState(false);
  const hasTags = post.taggedUsers && post.taggedUsers.length > 0;
  
  const isReel = post.type === 'reel';

  const mediaContent = () => {
    if (post.videoUrl) {
      return (
        <video 
          src={post.videoUrl} 
          controls 
          muted 
          loop 
          className={`w-full h-full ${isReel ? 'object-cover' : 'object-contain'}`}
        />
      );
    }
    if (post.imageUrl) {
      return <img src={post.imageUrl} alt={post.caption} className="w-full h-auto" />;
    }
    return null;
  };

  return (
    <div className={`relative w-full bg-black ${isReel ? 'aspect-[9/16]' : 'h-auto'}`}>
      {mediaContent()}

      {isReel && (
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full p-1.5">
          <ReelsIcon className="w-4 h-4 text-white" filled={false} />
        </div>
      )}

      {hasTags && !showTags && (
        <button
          onClick={() => setShowTags(true)}
          className="absolute bottom-2 left-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm"
          title="View tagged users"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}

      {hasTags && showTags && (
        <TaggedUsersOverlay users={post.taggedUsers!} onClick={() => setShowTags(false)} />
      )}
    </div>
  );
};

const PostAuthorInfo: React.FC<{
  author: User;
  taggedUsers?: User[];
  timestamp: string;
  onViewProfile: (userId: string) => void;
  currentUserId: string;
  followedUserIds: Set<string>;
  onToggleFollow: (userId: string) => void;
  isTopUser: boolean;
}> = ({ author, taggedUsers = [], timestamp, onViewProfile, currentUserId, followedUserIds, onToggleFollow, isTopUser }) => {
  const allUsersInPost = [author, ...taggedUsers];
  
  const isFollowing = followedUserIds.has(author.id);
  const isNotCurrentUser = author.id !== currentUserId;

  const getTextualInfo = () => {
    const authorButton = (
      <button onClick={() => onViewProfile(author.id)} className="font-bold hover:underline flex items-center gap-1">
        {author.username}
        {isTopUser && <CrownIcon className="w-4 h-4 text-yellow-400" />}
      </button>
    );
    
    if (taggedUsers.length === 0) {
      return (
        <div className="flex items-center gap-2">
            {authorButton}
            {isNotCurrentUser && (
                <>
                    <span className="text-gray-500 text-xs">·</span>
                    <button onClick={() => onToggleFollow(author.id)} className={`text-xs font-semibold ${isFollowing ? 'text-gray-400' : 'text-blue-400'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
                </>
            )}
        </div>
      );
    }
    const firstTagged = taggedUsers[0];
    const remainingCount = taggedUsers.length - 1;
    
    return (
      <div className="text-sm truncate">
        {authorButton}
        <span className="text-gray-300"> is with </span>
        <button onClick={() => onViewProfile(firstTagged.id)} className="font-bold hover:underline">{firstTagged.username}</button>
        {remainingCount > 0 && <span className="text-gray-300"> and {remainingCount} other{remainingCount > 1 ? 's' : ''}</span>}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex -space-x-4 flex-shrink-0">
        {allUsersInPost.slice(0, 2).reverse().map((user, index) => (
          <button key={user.id} onClick={() => onViewProfile(user.id)} className={`relative z-[${10 - index}]`}>
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-9 h-9 rounded-full border-2 border-zinc-800"
            />
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{getTextualInfo()}</div>
        <p className="text-xs text-gray-300 truncate">{timestamp}</p>
      </div>
    </div>
  );
};


const PostComponent: React.FC<PostProps> = ({ post, onViewProfile, currentUserId, onCommentClick, onRepost, followedUserIds, onToggleFollow, topUsers }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const isRepost = !!post.originalPost;
  
  const isAuthorTopUser = (authorId: string) => topUsers.includes(authorId);

  if (isRepost && post.originalPost) {
    const originalPost = post.originalPost;
    return (
      <div className="w-full bg-zinc-800 my-2 rounded-2xl overflow-hidden flex flex-col p-3">
        <div className="text-xs text-gray-400 font-semibold flex items-center gap-2 mb-2">
          <ShareIcon className="w-4 h-4" />
          <button onClick={() => onViewProfile(post.author.id)} className="hover:underline flex items-center gap-1">
            {post.author.id === currentUserId ? 'You' : post.author.username}
            {isAuthorTopUser(post.author.id) && <CrownIcon className="w-3 h-3 text-yellow-400" />}
          </button>
           shared
        </div>
        {post.caption && (
          <p className="text-sm text-gray-200 mb-3 whitespace-pre-wrap">{post.caption}</p>
        )}
        <div className="border border-gray-700 rounded-xl overflow-hidden flex flex-col">
           <div className="p-3">
            <PostAuthorInfo 
                author={originalPost.author} 
                taggedUsers={originalPost.taggedUsers} 
                timestamp={originalPost.timestamp} 
                onViewProfile={onViewProfile} 
                currentUserId={currentUserId}
                followedUserIds={followedUserIds}
                onToggleFollow={onToggleFollow}
                isTopUser={isAuthorTopUser(originalPost.author.id)}
            />
          </div>
          
          {originalPost.caption && (
             <p className="px-3 pb-3 text-sm text-gray-300 whitespace-pre-wrap">{originalPost.caption}</p>
          )}

          {(originalPost.imageUrl || originalPost.videoUrl) && <PostMedia post={originalPost} />}
        </div>
        
        <div className="flex justify-between items-center text-white pt-3">
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => setIsLiked(!isLiked)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                    <HeartIcon className="w-5 h-5 text-white" filled={isLiked} />
                </button>
                <button onClick={() => onCommentClick(post)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                    <CommentIcon className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => onRepost(originalPost)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                    <ShareIcon className="w-5 h-5 text-white" />
                </button>
            </div>
            <button onClick={() => setIsBookmarked(!isBookmarked)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                <BookmarkIcon className="w-5 h-5 text-white" filled={isBookmarked} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-800 my-2 rounded-2xl overflow-hidden flex flex-col">
      <div>
        {post.imageUrl || post.videoUrl ? (
          <PostMedia post={post} />
        ) : (
          <div className="w-full min-h-[180px] flex items-center justify-center p-6">
              <p className="text-center text-gray-300">{post.caption}</p>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center text-white">
           <div className="flex-1 min-w-0">
              <PostAuthorInfo 
                author={post.author} 
                taggedUsers={post.taggedUsers} 
                timestamp={post.timestamp} 
                onViewProfile={onViewProfile} 
                currentUserId={currentUserId}
                followedUserIds={followedUserIds}
                onToggleFollow={onToggleFollow}
                isTopUser={isAuthorTopUser(post.author.id)}
              />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => setIsLiked(!isLiked)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <HeartIcon className="w-5 h-5 text-white" filled={isLiked} />
            </button>
            <button onClick={() => onCommentClick(post)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <CommentIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => onRepost(post)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <ShareIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setIsBookmarked(!isBookmarked)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <BookmarkIcon className="w-5 h-5 text-white" filled={isBookmarked} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComponent;