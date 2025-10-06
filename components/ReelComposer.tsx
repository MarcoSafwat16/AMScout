
import React, { useState, useRef, useMemo } from 'react';
import { User } from '../types';

interface ReelComposerProps {
  onClose: () => void;
  onReelSubmit: (videoFile: File, caption: string, taggedUsers: string[]) => void;
  allUsers: User[];
  currentUser: User;
}

type FilterType = 'none' | 'grayscale' | 'sepia' | 'invert';

const FILTERS: { name: string; value: FilterType }[] = [
    { name: 'Normal', value: 'none' },
    { name: 'B&W', value: 'grayscale' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Invert', value: 'invert' },
];

const ReelComposer: React.FC<ReelComposerProps> = ({ onClose, onReelSubmit, allUsers, currentUser }) => {
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [isTagging, setIsTagging] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setStep(2); // Move to edit step
    } else {
        alert("Please select a valid video file.");
    }
  };

  const handlePublish = () => {
    if (videoFile) {
      const taggedUsernames = selectedUsers.map(u => u.username);
      onReelSubmit(videoFile, caption, taggedUsernames);
    }
  };
  
  const handleToggleTagUser = (user: User) => {
    setSelectedUsers(prev => prev.some(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user]);
  };

  const filteredUsersForTagging = useMemo(() => {
    const availableUsers = allUsers.filter(u => u.id !== currentUser.id);
    if (!tagSearchTerm) return availableUsers;
    return availableUsers.filter(user => user.username.toLowerCase().includes(tagSearchTerm.toLowerCase()));
  }, [allUsers, currentUser, tagSearchTerm]);
  
  const filterClass = {
    'none': 'filter-none',
    'grayscale': 'filter grayscale',
    'sepia': 'filter sepia',
    'invert': 'filter invert',
  }[activeFilter];


  const renderStep = () => {
    switch (step) {
      case 1: // Select Video
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <input type="file" accept="video/*" ref={fileInputRef} onChange={handleVideoChange} className="hidden" />
            <h2 className="text-2xl font-bold mb-4">Create Reel</h2>
            <p className="text-gray-400 mb-8">Select a video from your camera roll to get started.</p>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0c3a99] hover:bg-[#1049b8] text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
                Select Video
            </button>
          </div>
        );
      
      case 2: // Edit (Filters & Tagging)
        return (
          <div className="flex flex-col h-full">
            <div className="flex-grow relative bg-black flex items-center justify-center">
                {videoPreview && <video src={videoPreview} muted loop autoPlay playsInline className={`w-full h-full object-contain ${filterClass}`} />}
            </div>
            <div className="p-4 bg-zinc-900">
                <h3 className="text-sm font-semibold mb-2">Filters</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {FILTERS.map(filter => (
                        <button key={filter.value} onClick={() => setActiveFilter(filter.value)} className="flex-shrink-0 text-center">
                           <div className={`w-16 h-16 rounded-md overflow-hidden border-2 ${activeFilter === filter.value ? 'border-blue-500' : 'border-transparent'}`}>
                             {videoPreview && <video src={videoPreview} muted className={`w-full h-full object-cover filter ${filter.value !== 'none' ? filter.value : ''}`} />}
                           </div>
                           <p className="text-xs mt-1">{filter.name}</p>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        );
        
      case 3: // Finalize (Caption & Publish)
        return (
          <div className="flex flex-col h-full">
             <div className="flex-grow p-4">
                <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full h-24 bg-transparent text-lg placeholder-gray-500 focus:outline-none resize-none"
                />
                 <button onClick={() => setIsTagging(prev => !prev)} className={`mt-4 flex items-center gap-2 text-sm p-2 rounded-lg w-full text-left ${isTagging ? 'bg-blue-900/40' : 'hover:bg-zinc-800'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>{selectedUsers.length > 0 ? `${selectedUsers.length} people tagged` : "Tag people"}</span>
                 </button>

                 {isTagging && (
                     <div className="mt-2 p-2 bg-zinc-800 rounded-lg">
                        <input type="text" value={tagSearchTerm} onChange={e => setTagSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 border border-gray-600 rounded-md p-2 mb-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none" />
                        <div className="max-h-32 overflow-y-auto">
                            {filteredUsersForTagging.map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return <div key={user.id} onClick={() => handleToggleTagUser(user)} className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${isSelected ? 'bg-blue-900/50' : 'hover:bg-zinc-700'}`}>
                                    <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                                    <span>{user.username}</span>
                                </div>
                            })}
                        </div>
                     </div>
                 )}
             </div>
              {videoPreview && <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 m-4"><video src={videoPreview} muted className={`w-full h-full object-cover ${filterClass}`} /></div>}
          </div>
        );
        
      default:
        return null;
    }
  };

  const headerTitle = step === 1 ? "" : step === 2 ? "Edit Reel" : "New Reel";

  return (
    <div className="fixed inset-0 bg-[#1C1C1E] z-50 flex flex-col">
      <header className="p-4 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm flex-shrink-0">
         {step === 1 && <button onClick={onClose} className="text-2xl">&times;</button>}
         {step > 1 && <button onClick={() => setStep(step - 1)}>Back</button>}
         <h2 className="font-bold text-lg">{headerTitle}</h2>
         {step < 3 && <button onClick={() => step < 3 && setStep(step + 1)} disabled={!videoFile} className="font-semibold text-blue-500 disabled:text-gray-500">Next</button>}
         {step === 3 && <button onClick={handlePublish} className="font-semibold text-blue-500">Publish</button>}
      </header>
      <div className="flex-grow overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default ReelComposer;
