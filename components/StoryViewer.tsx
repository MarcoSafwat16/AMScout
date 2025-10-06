
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserStories, User, Comment } from '../types';
import HeartIcon from './icons/HeartIcon';
import SendIcon from './icons/SendIcon';

interface StoryViewerProps {
  userStories: UserStories;
  currentUser: User;
  onClose: () => void;
  onNextUser: () => void;
  onPrevUser: () => void;
  onViewProfile: (userId: string) => void;
  onAddComment: (storyId: string, commentText: string, authorId: string) => void;
  onAddReaction: (storyId: string, authorId: string) => void;
}

const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

const AnimatedComment: React.FC<{ comment: Comment }> = ({ comment }) => (
    <div className="absolute bottom-24 left-4 max-w-[75%] bg-black/50 p-2 rounded-lg pointer-events-none animate-fade-in-up">
        <div className="flex items-center gap-2">
            <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-6 h-6 rounded-full" />
            <div>
                <p className="text-xs font-bold text-white">{comment.user.username}</p>
                <p className="text-sm text-white">{comment.text}</p>
            </div>
        </div>
    </div>
);

const StoryViewer: React.FC<StoryViewerProps> = ({ userStories, currentUser, onClose, onNextUser, onPrevUser, onViewProfile, onAddComment, onAddReaction }) => {
    useEffect(() => {
        if (!userStories?.stories?.length) {
            onClose();
        }
    }, [userStories, onClose]);

    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [activeCommentIndex, setActiveCommentIndex] = useState(0);
    const timerRef = useRef<number | null>(null);
    const lastTap = useRef(0);

    const currentStory = userStories?.stories?.[currentStoryIndex];

    const isOwner = currentUser.id === userStories.user.id;
    const comments = useMemo(() => currentStory?.comments || [], [currentStory]);
    const reactions = useMemo(() => currentStory?.reactions || [], [currentStory]);
    const hasReacted = useMemo(() => reactions.some(r => r.user.id === currentUser.id), [reactions, currentUser.id]);
    const displayedComment = comments.length > 0 ? comments[activeCommentIndex] : null;

    const goToNextStory = () => {
        if (currentStoryIndex < userStories.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            onNextUser();
        }
    };

    const goToPrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else {
            onPrevUser();
        }
    };

    useEffect(() => {
        // Story progress timer
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!isPaused && currentStory) {
            timerRef.current = window.setTimeout(goToNextStory, currentStory.duration * 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentStoryIndex, userStories, isPaused, onNextUser, currentStory]);

    useEffect(() => {
      // Comment animation timer
      if (isPaused || !comments.length) return;
      const commentTimer = setTimeout(() => {
        setActiveCommentIndex(prev => (prev + 1) % comments.length);
      }, 4000); // Cycle every 4s
      return () => clearTimeout(commentTimer);
    }, [activeCommentIndex, comments.length, isPaused]);

    useEffect(() => {
      // Reset comment index when story changes
      setActiveCommentIndex(0);
    }, [currentStory?.id]);

    const handleInteractionStart = () => setIsPaused(true);
    const handleInteractionEnd = () => setIsPaused(false);
    
    const handleReaction = () => {
        if (!hasReacted) {
            setShowHeart(true);
            onAddReaction(currentStory.id, userStories.user.id);
            setTimeout(() => setShowHeart(false), 800);
        }
    };

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const now = new Date().getTime();
        if (now - lastTap.current < 300) { // Double tap
            handleReaction();
        } else { // Single tap
            const rect = e.currentTarget.getBoundingClientRect();
            const tapX = e.clientX - rect.left;
            if (tapX < rect.width / 3) {
                goToPrevStory();
            } else {
                goToNextStory();
            }
        }
        lastTap.current = now;
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim() && currentStory) {
            onAddComment(currentStory.id, commentText, userStories.user.id);
            setCommentText('');
        }
    };

    if (!userStories?.stories?.length || !currentStory) {
        return null; 
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center">
                <div 
                    className="relative w-full aspect-[9/16] max-h-full rounded-lg overflow-hidden select-none bg-zinc-900"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                    onClick={handleTap}
                >
                    <img src={currentStory.contentUrl} alt={`Story by ${userStories.user.username}`} className="w-full h-full object-cover" />

                    {showHeart && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <HeartIcon className="w-24 h-24 text-white drop-shadow-lg animate-heart-pop" filled={true} />
                        </div>
                    )}

                    {displayedComment && <AnimatedComment key={activeCommentIndex} comment={displayedComment} />}
                </div>

                <div className="absolute top-0 left-0 right-0 p-4 z-10">
                    <div className="flex gap-1">
                        {userStories.stories.map((_, index) => (
                            <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-transform duration-100 ease-linear"
                                     style={{
                                        width: '100%',
                                        transform: index < currentStoryIndex ? 'scaleX(1)' : (index === currentStoryIndex ? 'scaleX(1)' : 'scaleX(0)'),
                                        animation: (index === currentStoryIndex && !isPaused) ? `story-progress ${currentStory.duration}s linear forwards` : 'none'
                                     }} />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => onViewProfile(userStories.user.id)}>
                           <img src={userStories.user.avatarUrl} alt={userStories.user.username} className="w-10 h-10 rounded-full" />
                        </button>
                        <button onClick={() => onViewProfile(userStories.user.id)} className="font-bold text-sm text-white">{userStories.user.username}</button>
                        <span className="text-sm text-gray-300">{formatTimeAgo(currentStory.timestamp)}</span>
                         <button onClick={onClose} className="text-white text-2xl ml-auto bg-black/30 w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {isOwner && (
                        <div className="flex items-center gap-4 mb-2 bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                           <div className="flex items-center gap-1 text-white text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <span className="font-semibold">3,450</span> {/* Mock views */}
                           </div>
                           <div className="flex items-center gap-2 text-white text-sm">
                                <HeartIcon className="w-4 h-4" filled={true} />
                                <span className="font-semibold">{reactions.length}</span>
                           </div>
                           <div className="flex -space-x-2">
                                {reactions.slice(0, 4).map(r => (
                                    <img key={r.user.id} src={r.user.avatarUrl} className="w-6 h-6 rounded-full border-2 border-black" alt={r.user.username} />
                                ))}
                           </div>
                        </div>
                    )}
                    <form onSubmit={handleAddComment} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/40 text-white placeholder:text-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/80"
                            onFocus={handleInteractionStart}
                            onBlur={handleInteractionEnd}
                        />
                        <button type="button" onClick={handleReaction} className={`p-2 transition-transform ${hasReacted ? 'scale-110' : 'hover:scale-110'}`}>
                            <HeartIcon className={`w-7 h-7 text-white ${hasReacted ? 'text-red-500' : ''}`} filled={hasReacted}/>
                        </button>
                        <button type="submit" disabled={!commentText.trim()} className="p-2 disabled:opacity-50">
                            <SendIcon className="w-6 h-6 text-white"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;