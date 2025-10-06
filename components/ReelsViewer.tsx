
import React, { useRef, useEffect, useState } from 'react';
import { Post, User } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import ShareIcon from './icons/ShareIcon';
import CrownIcon from './icons/CrownIcon';

const TaggedUsersOverlay: React.FC<{ users: User[], onClick: () => void }> = ({ users, onClick }) => (
  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 cursor-pointer" onClick={onClick}>
    <h4 className="text-xs font-bold text-gray-300 mb-2">In this reel:</h4>
    <div className="flex flex-wrap gap-2">
      {users.map(user => (
        <span key={user.id} className="text-sm font-semibold bg-black/50 text-white px-2 py-1 rounded-md">
          @{user.username}
        </span>
      ))}
    </div>
  </div>
);

interface ReelItemProps {
  reel: Post;
  isIntersecting: boolean;
  onViewProfile: (userId: string) => void;
  onCommentClick: (post: Post) => void;
  onRepost: (post: Post) => void;
  currentUser: User;
  followedUserIds: Set<string>;
  onToggleFollow: (userId: string) => void;
  topUsers: string[];
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isIntersecting, onViewProfile, onCommentClick, onRepost, currentUser, followedUserIds, onToggleFollow, topUsers }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [showTags, setShowTags] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [liveLikes, setLiveLikes] = useState<{ id: number; user: User; left: string; duration: string }[]>([]);

  const hasTags = reel.taggedUsers && reel.taggedUsers.length > 0;
  const isFollowing = followedUserIds.has(reel.author.id);
  const isNotCurrentUser = reel.author.id !== currentUser.id;
  const isTopUser = topUsers.includes(reel.author.id);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isIntersecting) {
      video.play().then(() => setIsPlaying(true)).catch(e => { /* Autoplay was prevented */ });
    } else {
      video.pause();
      video.currentTime = 0; // Reset video on scroll away
      setIsPlaying(false);
    }
  }, [isIntersecting]);
  
  useEffect(() => {
    if (isIntersecting && reel.likedBy && reel.likedBy.length > 0) {
      const interval = setInterval(() => {
        const randomUser = reel.likedBy![Math.floor(Math.random() * reel.likedBy!.length)];
        const newLike = {
          id: Date.now() + Math.random(),
          user: randomUser,
          left: `${Math.random() * 25 + 5}%`,
          duration: `${Math.random() * 2 + 3}s`,
        };
        
        setLiveLikes(prev => [...prev.slice(-10), newLike]); // Keep the array size manageable

      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isIntersecting, reel.likedBy]);


  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(current => newLikedState ? current + 1 : current - 1);
    if (newLikedState) { // Animate only when liking
      setShowLikeAnimation(true);
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000); // Corresponds to animation duration
    }
  };

  return (
    <div className="h-full snap-center relative flex items-center justify-center bg-black">
      {/* Container to enforce 9:16 aspect ratio on desktop */}
      <div className="relative h-full w-full md:aspect-[9/16] md:w-auto md:h-auto max-w-full max-h-full overflow-hidden">
        <video 
          ref={videoRef} 
          src={reel.videoUrl} 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
          onClick={togglePlay} 
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
          </div>
        )}

        {showLikeAnimation && (
          <div className="absolute bottom-24 right-4 animate-like-bubble pointer-events-none z-20">
            <div className="relative">
              <img src={currentUser.avatarUrl} alt="Liked by you" className="w-12 h-12 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 flex items-center justify-center border-2 border-black">
                <HeartIcon className="w-3 h-3 text-white" filled={true} />
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-20 left-0 h-48 w-1/3 pointer-events-none overflow-hidden">
          {liveLikes.map(like => (
            <div
              key={like.id}
              className="absolute bottom-0 animate-float-up"
              style={{ left: like.left, animationDuration: like.duration }}
              onAnimationEnd={() => setLiveLikes(prev => prev.filter(l => l.id !== like.id))}
            >
              <div className="relative">
                <img src={like.user.avatarUrl} alt={like.user.username} className="w-10 h-10 rounded-full border-2 border-white/50" />
                <div className="absolute -bottom-2 -right-2">
                    <HeartIcon className="w-6 h-6 text-red-500" filled={true}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end z-10">
          <div className="flex-1 min-w-0 pr-10">
            <div className="flex items-center gap-3">
              <button onClick={() => onViewProfile(reel.author.id)}>
                <img src={reel.author.avatarUrl} alt={reel.author.username} className="w-10 h-10 rounded-full border-2 border-white/80" />
              </button>
              <div className="flex items-center gap-2">
                  <button onClick={() => onViewProfile(reel.author.id)} className="font-bold text-sm truncate hover:underline flex items-center gap-1">
                    {reel.author.username}
                    {isTopUser && <CrownIcon className="w-4 h-4 text-yellow-400" />}
                  </button>
                  {isNotCurrentUser && (
                    <button onClick={() => onToggleFollow(reel.author.id)} className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${isFollowing ? 'border-gray-500 text-gray-400' : 'border-white text-white'}`}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
              </div>
            </div>
            <p className="text-sm mt-2 truncate">{reel.caption}</p>
          </div>

          <div className="flex flex-col items-center gap-5">
            <button onClick={handleLike} className="flex flex-col items-center gap-1 text-center">
              <HeartIcon className={`w-7 h-7 ${isLiked ? 'text-red-500' : 'text-white'}`} filled={isLiked} />
              <span className="text-xs font-semibold">{likeCount}</span>
            </button>
            <button onClick={() => onCommentClick(reel)} className="flex flex-col items-center gap-1 text-center">
              <CommentIcon className="w-7 h-7 text-white" />
              <span className="text-xs font-semibold">{reel.comments.length}</span>
            </button>
            <button onClick={() => onRepost(reel)} className="flex flex-col items-center gap-1 text-center">
              <ShareIcon className="w-7 h-7 text-white" />
              <span className="text-xs font-semibold">{reel.reposts}</span>
            </button>
          </div>
        </div>
        
        {hasTags && !showTags && (
          <button
            onClick={() => setShowTags(true)}
            className="absolute bottom-28 left-4 bg-black/50 rounded-full p-1.5 backdrop-blur-sm transition-opacity hover:opacity-80 z-10"
            title="View tagged users"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        )}

        {hasTags && showTags && (
          <TaggedUsersOverlay users={reel.taggedUsers!} onClick={() => setShowTags(false)} />
        )}
      </div>
    </div>
  );
};

interface ReelsViewerProps {
  reels: Post[];
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onCommentClick: (post: Post) => void;
  onRepost: (post: Post) => void;
  currentUser: User;
  followedUserIds: Set<string>;
  onToggleFollow: (userId: string) => void;
  topUsers: string[];
}

const ReelsViewer: React.FC<ReelsViewerProps> = ({ reels, onClose, onViewProfile, onCommentClick, onRepost, currentUser, followedUserIds, onToggleFollow, topUsers }) => {
  const [visibleReelId, setVisibleReelId] = useState<string | null>(reels.length > 0 ? reels[0].id : null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleReelId(entry.target.getAttribute('data-reel-id'));
          }
        });
      },
      { root: containerRef.current, threshold: 0.7 }
    );

    const currentRefs = reelRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [reels]);

  return (
    <div className="fixed inset-0 z-50 bg-black md:reels-viewer-desktop-container">
      <div className="h-full md:reels-viewer-desktop-content">
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h2 className="text-xl font-bold text-white">Reels</h2>
          <button onClick={onClose} className="text-white text-3xl leading-none">&times;</button>
        </header>
        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
          {reels.map((reel) => (
            <div
              key={reel.id}
              ref={el => {
                if (el) {
                  reelRefs.current.set(reel.id, el);
                } else {
                  reelRefs.current.delete(reel.id);
                }
              }}
              data-reel-id={reel.id}
              className="h-full w-full"
            >
              <ReelItem
                reel={reel}
                isIntersecting={visibleReelId === reel.id}
                onViewProfile={onViewProfile}
                onCommentClick={onCommentClick}
                onRepost={onRepost}
                currentUser={currentUser}
                followedUserIds={followedUserIds}
                onToggleFollow={onToggleFollow}
                topUsers={topUsers}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelsViewer;