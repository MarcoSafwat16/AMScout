
import React from 'react';
import PostComponent from './Post';
import { Post } from '../types';

interface FeedProps {
  posts: Post[];
  onViewProfile: (userId: string) => void;
  currentUserId: string;
  onCommentClick: (post: Post) => void;
  onRepost: (post: Post) => void;
  followedUserIds: Set<string>;
  onToggleFollow: (userId: string) => void;
  // Fix: Added topUsers to FeedProps to match what is passed from App.tsx
  topUsers: string[];
}

const Feed: React.FC<FeedProps> = ({ posts, onViewProfile, currentUserId, onCommentClick, onRepost, followedUserIds, onToggleFollow, topUsers }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col">
        {posts.map((post) => (
          <PostComponent 
            key={post.id} 
            post={post} 
            onViewProfile={onViewProfile} 
            currentUserId={currentUserId}
            onCommentClick={onCommentClick}
            onRepost={onRepost}
            followedUserIds={followedUserIds}
            onToggleFollow={onToggleFollow}
            // Fix: Passed topUsers prop down to PostComponent
            topUsers={topUsers}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;