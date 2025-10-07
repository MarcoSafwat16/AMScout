
import React, { useState, useRef } from 'react';
import PaperclipIcon from './icons/PaperclipIcon';
import SendIcon from './icons/SendIcon';
import StickerIcon from './icons/StickerIcon';
import StickerPicker from './StickerPicker';

interface MessageInputProps {
  onSendMessage: (message: { text?: string; stickerUrl?: string; mediaFile?: File }) => void;
  userStickers: string[];
  onOpenStickerCreator: () => void;
  aiSuggestions: string[];
  isLoadingAiSuggestions: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, userStickers, onOpenStickerCreator, aiSuggestions, isLoadingAiSuggestions }) => {
  const [text, setText] = useState('');
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text });
      setText('');
    }
  };
  
  const handleSendSuggestion = (suggestion: string) => {
    onSendMessage({ text: suggestion });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSendMessage({ mediaFile: file });
    }
     // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSelectSticker = (stickerUrl: string) => {
    onSendMessage({ stickerUrl });
    setIsStickerPickerOpen(false);
  };
  
  return (
    <div className="p-3 border-t border-gray-800 bg-zinc-900 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
      />
      
      {isStickerPickerOpen && <StickerPicker stickers={userStickers} onSelectSticker={handleSelectSticker} onClose={() => setIsStickerPickerOpen(false)} onOpenCreator={onOpenStickerCreator}/>}

      {(isLoadingAiSuggestions || aiSuggestions.length > 0) && (
        <div className="pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {isLoadingAiSuggestions && (
                 <div className="px-3 py-1.5 text-xs text-gray-400 bg-zinc-800 rounded-full animate-pulse">
                    Generating replies...
                 </div>
            )}
            {!isLoadingAiSuggestions && aiSuggestions.map((suggestion, index) => (
                <button 
                    key={index}
                    onClick={() => handleSendSuggestion(suggestion)}
                    className="px-3 py-1.5 text-xs text-gray-200 bg-zinc-700 hover:bg-zinc-600 rounded-full whitespace-nowrap"
                >
                    {suggestion}
                </button>
            ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach File">
          <PaperclipIcon className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>
        <button type="button" onClick={() => setIsStickerPickerOpen(true)} title="Select Sticker">
          <StickerIcon className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center disabled:bg-gray-600 transition-colors"
          aria-label="Send Message"
        >
          <SendIcon className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;