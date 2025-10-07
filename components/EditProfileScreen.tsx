import React, { useState } from 'react';
import { User } from '../types';

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
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!formData.fullName.trim() || !formData.username.trim()) {
      alert('Full Name and Username cannot be empty.');
      setIsLoading(false);
      return;
    }
    await onSave(formData);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
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
  );
};

export default EditProfileScreen;
