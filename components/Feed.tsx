import React from 'react';
import PostComponent from './Post';
import { Post, User } from '../types';

interface FeedProps {
  posts: Post[];
  onViewProfile: (userId: string) => void;
  currentUser: User;
  onCommentClick: (post: Post) => void;
  onRepost: (post: Post) => void;
  onToggleFollow: (userId: string) => void;
  topUsers: string[];
}

const Feed: React.FC<FeedProps> = ({ posts, onViewProfile, currentUser, onCommentClick, onRepost, onToggleFollow, topUsers }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col">
        {posts.map((post) => (
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
    </div>
  );
};

export default Feed;
