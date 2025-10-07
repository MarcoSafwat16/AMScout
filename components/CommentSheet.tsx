import React, { useState, useRef } from 'react';
import { Post, Comment, User } from '../types';
import HeartIcon from './icons/HeartIcon';

interface CommentItemProps {
  comment: Comment;
  onReplyClick: (comment: Comment) => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReplyClick, currentUser, onToggleFollow }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(l => isLiked ? l - 1 : l + 1);
  };
  
  const isNotCurrentUser = comment.user.id !== currentUser.id;
  const isFollowing = currentUser.following?.includes(comment.user.id);

  return (
    <div className="py-3">
        <div className="flex items-start gap-3">
            <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <p>
                        <span className="font-semibold text-sm mr-2">{comment.user.username}</span>
                        <span className="text-gray-300 text-sm">{comment.text}</span>
                    </p>
                    {isNotCurrentUser && (
                        <button onClick={() => onToggleFollow(comment.user.id)} className={`text-xs font-semibold flex-shrink-0 ${isFollowing ? 'text-gray-500' : 'text-blue-400'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <button onClick={handleLike} className="flex items-center gap-1 hover:text-white transition-colors">
                        <HeartIcon className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500' : ''}`} filled={isLiked} /> 
                        {likes > 0 && <span>{likes}</span>}
                    </button>
                    <button onClick={() => onReplyClick(comment)} className="hover:text-white transition-colors">Reply</button>
                </div>
            </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
            <div className="pl-8 mt-2 space-y-2 border-l-2 border-gray-700 ml-4">
                {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} onReplyClick={onReplyClick} currentUser={currentUser} onToggleFollow={onToggleFollow} />)}
            </div>
        )}
    </div>
  );
};

interface CommentSheetProps {
  post: Post;
  onClose: () => void;
  onAddComment: (postId: string, text: string, parentId?: string) => void;
  currentUser: User;
  onToggleFollow: (userId: string) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ post, onClose, onAddComment, currentUser, onToggleFollow }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment, replyingTo?.id);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end" onClick={onClose}>
      <div 
        className="bg-[#1C1C1E] w-full max-w-lg mx-auto h-[85vh] rounded-t-2xl flex flex-col shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-4 border-b border-gray-700/60 flex items-center justify-center relative">
          <h2 className="font-bold text-lg">Comments</h2>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-800/60">
          {post.comments && post.comments.length > 0 ? (
             post.comments.map(comment => <CommentItem key={comment.id} comment={comment} onReplyClick={handleReplyClick} currentUser={currentUser} onToggleFollow={onToggleFollow}/>)
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p>No comments yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <footer className="p-3 border-t border-gray-700/60 bg-[#101010]">
          {replyingTo && (
            <div className="text-xs text-gray-400 px-2 pb-2 flex justify-between items-center">
              <span>Replying to @{replyingTo.user.username}</span>
              <button onClick={cancelReply} className="font-semibold hover:text-white">&times;</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <img src={currentUser.avatarUrl} alt="Your avatar" className="w-9 h-9 rounded-full object-cover" />
            <input 
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : "Add a comment..."}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
              autoFocus
            />
            <button type="submit" className="text-[#0c3a99] hover:text-blue-400 font-semibold text-sm disabled:text-gray-500 disabled:hover:text-gray-500 transition-colors" disabled={!newComment.trim()}>Post</button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default CommentSheet;
