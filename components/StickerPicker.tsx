import React from 'react';
import AddIcon from './icons/AddIcon';

interface StickerPickerProps {
  stickers: string[];
  onSelectSticker: (stickerUrl: string) => void;
  onClose: () => void;
  onOpenCreator: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ stickers, onSelectSticker, onClose, onOpenCreator }) => {
  const handleOpenCreator = () => {
    onClose();
    onOpenCreator();
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end" onClick={onClose}>
      <div 
        className="bg-[#1C1C1E] w-full max-w-lg mx-auto h-[50vh] rounded-t-2xl flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700/60 flex items-center justify-between relative">
          <h2 className="font-bold text-lg">Stickers</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-4">
                <button 
                    onClick={handleOpenCreator}
                    className="aspect-square bg-zinc-800 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                    <AddIcon className="w-8 h-8" />
                    <span className="text-xs mt-1">Create</span>
                </button>

                {stickers.map((stickerUrl, index) => (
                    <button 
                        key={index} 
                        onClick={() => onSelectSticker(stickerUrl)}
                        className="aspect-square bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        <img src={stickerUrl} alt={`Sticker ${index + 1}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
