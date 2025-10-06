
import React, { useState, useEffect } from 'react';
import ComposeIcon from './icons/ComposeIcon';
import ReelsIcon from './icons/ReelsIcon';

interface CreationChoiceModalProps {
  onClose: () => void;
  onSelectPost: () => void;
  onSelectReel: () => void;
}

const CreationChoiceModal: React.FC<CreationChoiceModalProps> = ({ onClose, onSelectPost, onSelectReel }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#1C1C1E] w-full max-w-lg rounded-t-2xl p-4 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-gray-700 rounded-full mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-center mb-4">Create</h2>
        <div className="flex justify-around gap-4">
          <button 
            onClick={onSelectPost} 
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/60 rounded-xl w-full hover:bg-gray-700/80 transition-colors"
          >
            <ComposeIcon className="w-8 h-8 text-gray-300" />
            <span className="font-semibold">Post</span>
          </button>
          <button 
            onClick={onSelectReel} 
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/60 rounded-xl w-full hover:bg-gray-700/80 transition-colors"
          >
            <ReelsIcon className="w-8 h-8 text-gray-300" filled={false} />
            <span className="font-semibold">Reel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationChoiceModal;
