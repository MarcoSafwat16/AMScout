
import React from 'react';
import { Notification, Post } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import ProfileIcon from './icons/ProfileIcon';

interface NotificationsScreenProps {
  notifications: Notification[];
  onViewProfile: (userId: string) => void;
  // onNavigateToPost: (postId: string) => void; // Future implementation
}

const NotificationItem: React.FC<{
  notification: Notification;
  onViewProfile: (userId: string) => void;
}> = ({ notification, onViewProfile }) => {
  const { type, user, post, timestamp } = notification;

  const renderIcon = () => {
    switch (type) {
      case 'like':
        return <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><HeartIcon className="w-5 h-5 text-red-400" filled /></div>;
      case 'comment':
        return <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><CommentIcon className="w-5 h-5 text-blue-400" /></div>;
      case 'follow':
        return <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><ProfileIcon className="w-5 h-5 text-green-400" filled /></div>;
      default:
        return null;
    }
  };

  const renderText = () => {
    const userLink = (
      <button onClick={() => onViewProfile(user.id)} className="font-bold hover:underline">
        {user.username}
      </button>
    );

    switch (type) {
      case 'like':
        return <>{userLink} liked your post.</>;
      case 'comment':
        return <>{userLink} commented on your post.</>;
      case 'follow':
        return <>{userLink} started following you.</>;
      default:
        return null;
    }
  };

  const getPostMedia = (p: Post): React.ReactNode => {
      if (p.imageUrl) return <img src={p.imageUrl} alt="Post preview" className="w-12 h-12 object-cover rounded-md" />;
      if (p.videoUrl) return <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>;
      if (p.originalPost) return getPostMedia(p.originalPost);
      return null;
  }

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-zinc-800/50 rounded-lg">
      <div className="flex-shrink-0 relative">
        <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full" />
        <div className="absolute -bottom-1 -right-1">{renderIcon()}</div>
      </div>
      <div className="flex-1 text-sm">
        <p className="text-gray-200">{renderText()}</p>
        <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>
      </div>
      {post && (
        <div className="flex-shrink-0">
          {getPostMedia(post)}
        </div>
      )}
    </div>
  );
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ notifications, onViewProfile }) => {
  return (
    <div className="w-full">
        <div className="p-4 border-b border-zinc-800 hidden md:block">
            <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="flex flex-col">
            {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} onViewProfile={onViewProfile} />
            ))}
        </div>
        {notifications.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm">Your interactions will appear here.</p>
            </div>
        )}
    </div>
  );
};

export default NotificationsScreen;