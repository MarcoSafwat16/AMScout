import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from '../types';

interface ComposerProps {
  onClose: () => void;
  onPostSubmit: (caption: string, mediaFile: File | null, taggedUsers: string[]) => void;
  allUsers: User[];
  currentUser: User;
}

const Composer: React.FC<ComposerProps> = ({ onClose, onPostSubmit, allUsers, currentUser }) => {
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const characterLimit = 280;
  const remainingChars = characterLimit - postText.length;

  useEffect(() => {
    setIsVisible(true);
    return () => {
      // Clean up the object URL on unmount
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    if ((postText.trim() || mediaFile) && remainingChars >= 0) {
      const taggedUsernames = selectedUsers.map(u => u.username);
      onPostSubmit(postText, mediaFile, taggedUsernames);
    }
  };
  
  const handleToggleTagUser = (user: User) => {
    setSelectedUsers(prev => {
      if (prev.some(u => u.id === user.id)) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const filteredUsersForTagging = useMemo(() => {
    const availableUsers = allUsers.filter(u => u.id !== currentUser.id);
    if (!tagSearchTerm) {
        return availableUsers; // Show all suggestions by default
    }
    return availableUsers.filter(user => 
        user.username.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  }, [allUsers, currentUser, tagSearchTerm]);


  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      onClick={handleClose}
    >
      <div 
        className={`bg-zinc-900/80 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl shadow-blue-900/20 p-6 flex flex-col max-h-[90vh] transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 relative">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-28 bg-transparent text-lg placeholder-gray-500 focus:outline-none resize-none"
          />

          {mediaPreview && (
            <div className="mt-4 relative rounded-lg overflow-hidden">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls className="w-full max-h-64 object-contain rounded-lg" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
              )}
              <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 leading-none">&times;</button>
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="mt-4">
                <span className="text-sm font-semibold text-gray-400">With:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-1.5 bg-blue-900/50 text-blue-300 text-sm font-semibold px-2 py-1 rounded-full">
                            <img src={user.avatarUrl} alt={user.username} className="w-5 h-5 rounded-full" />
                            {user.username}
                        </div>
                    ))}
                </div>
            </div>
          )}
          
          {isTagging && (
             <div className="mt-4 border-t border-gray-700 pt-4">
                <input
                    type="text"
                    value={tagSearchTerm}
                    onChange={e => setTagSearchTerm(e.target.value)}
                    placeholder="Search for people to tag..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 mb-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
                    autoFocus
                />
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {filteredUsersForTagging.length > 0 ? filteredUsersForTagging.map(user => {
                        const isSelected = selectedUsers.some(u => u.id === user.id);
                        return (
                            <div key={user.id} onClick={() => handleToggleTagUser(user)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-900/50' : 'hover:bg-zinc-700'}`}>
                                <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                                <span className="font-medium text-sm">{user.username}</span>
                                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#0c3a99] border-[#0c3a99]' : 'border-gray-500'}`}>
                                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 p-4 text-sm">No users found.</p>
                    )}
                </div>
             </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center border-t border-gray-700 pt-4 flex-shrink-0">
          <div className="flex gap-2 text-gray-400">
            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleMediaChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full" title="Add Photo/Video">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={() => setIsTagging(prev => !prev)} className={`p-2 hover:bg-white/10 rounded-full ${isTagging ? 'bg-blue-500/20 text-blue-400' : ''}`} title="Tag people">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars}
            </span>
            <button 
                onClick={handlePublish}
                className="bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={(!postText.trim() && !mediaFile) || remainingChars < 0}
            >
                Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composer;