import React, { useState, useRef } from 'react';
import { User } from '../types';
import AvatarEditor from './AvatarEditor';

interface EditProfileScreenProps {
  currentUser: User;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ currentUser, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    username: currentUser.username,
    phoneNumber: currentUser.phoneNumber,
    bio: currentUser.bio || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!formData.fullName.trim() || !formData.username.trim()) {
      alert('Full Name and Username cannot be empty.');
      setIsLoading(false);
      return;
    }
    
    const updates: Partial<User> = { ...formData };
    if (newAvatarUrl) {
      updates.avatarUrl = newAvatarUrl;
    }

    await onSave(updates);
    setIsLoading(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageToEdit(objectUrl);
      setIsAvatarEditorOpen(true);
    }
    // Reset file input to allow selecting the same file again
    if(event.target) {
        event.target.value = "";
    }
  };
  
  const handleAvatarEditorClose = () => {
      setIsAvatarEditorOpen(false);
      if (imageToEdit) {
        URL.revokeObjectURL(imageToEdit); // Clean up memory
        setImageToEdit(null);
      }
  };
  
  const handleAvatarApply = (dataUrl: string) => {
      setNewAvatarUrl(dataUrl);
      handleAvatarEditorClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          
          <div className="flex flex-col items-center mb-6">
              <img src={newAvatarUrl || currentUser.avatarUrl} alt="Profile Avatar" className="w-24 h-24 rounded-full mb-3 object-cover" />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="text-blue-400 font-semibold text-sm hover:underline">
                  Change Photo
              </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-400">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-400">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
             <div>
              <label className="text-sm font-semibold text-gray-400">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us about yourself..."/>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-400">Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 font-semibold py-2 px-5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-5 rounded-lg text-sm transition-colors disabled:bg-gray-500">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      {isAvatarEditorOpen && imageToEdit && (
        <AvatarEditor
            imageSrc={imageToEdit}
            onClose={handleAvatarEditorClose}
            onApply={handleAvatarApply}
        />
      )}
    </>
  );
};

export default EditProfileScreen;