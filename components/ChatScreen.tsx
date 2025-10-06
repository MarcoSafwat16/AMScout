
import React, { useEffect, useRef, useState } from 'react';
import { User, Message } from '../types';
import MessageInput from './MessageInput';
import { generateChatReply } from '../services/geminiService';

interface ChatScreenProps {
  messages: Message[];
  currentUser: User;
  onSendMessage: (message: Omit<Message, 'sender' | 'id' | 'timestamp'>) => void;
  onGoBack: () => void;
  userStickers: string[];
  onOpenStickerCreator: () => void;
  allUsers: User[];
  topUsers: string[];
}

const ChatScreen: React.FC<ChatScreenProps> = ({ messages, currentUser, onSendMessage, onGoBack, userStickers, onOpenStickerCreator, allUsers, topUsers }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalMembers = allUsers.length;
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSuggestions = async () => {
        if (messages.length > 0) {
            setIsLoadingSuggestions(true);
            // Create a concise history for the AI model
            const history = messages.slice(-5).map(m => 
                `${m.sender.username === currentUser.username ? 'Me' : m.sender.username}: ${m.text || (m.imageUrl ? '[image]' : '[sticker]')}`
            ).join('\n');
            
            try {
                const result = await generateChatReply(history);
                setAiSuggestions(result.suggestions);
            } catch (error) {
                console.error("Failed to fetch AI suggestions:", error);
                setAiSuggestions([]); // Clear suggestions on error
            } finally {
                setIsLoadingSuggestions(false);
            }
        }
    };
    
    // Fetch suggestions when messages change, with a debounce effect
    const timer = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(timer);

  }, [messages, currentUser.username]);

  const renderMessageContent = (msg: Message, isTopUser: boolean) => {
    const contentClass = isTopUser ? "text-glow" : "";
    if (msg.text) {
        return <p className={`text-sm break-words ${contentClass}`}>{msg.text}</p>;
    }
    if (msg.imageUrl) {
        return <img src={msg.imageUrl} alt="Sent" className="rounded-lg max-w-xs max-h-64 object-cover" />;
    }
    if (msg.videoUrl) {
        return <video src={msg.videoUrl} controls className="rounded-lg max-w-xs max-h-64" />;
    }
    if (msg.stickerUrl) {
        return <img src={msg.stickerUrl} alt="Sticker" className="w-28 h-28 object-contain" />;
    }
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#1C1C1E]">
      {/* Header */}
      <header className="p-3 flex items-center gap-3 border-b border-gray-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10 md:hidden">
        <button onClick={onGoBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
            <h2 className="font-bold">Global Chat</h2>
            <p className="text-xs text-gray-400">{totalMembers} Members</p>
        </div>
      </header>
       <div className="p-4 border-b border-zinc-800 hidden md:block">
            <h2 className="font-bold text-xl">Global Chat</h2>
            <p className="text-sm text-gray-400">{totalMembers} Members</p>
       </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => {
          const isSentByMe = msg.sender.id === currentUser.id;
          const isTopUser = topUsers.includes(msg.sender.id);
          const showSenderInfo = !isSentByMe && (index === 0 || messages[index - 1].sender.id !== msg.sender.id);
          const isSticker = !!msg.stickerUrl;

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              {!isSentByMe && (
                <div className="w-8 flex-shrink-0">
                  {showSenderInfo && (
                    <img src={msg.sender.avatarUrl} alt={msg.sender.username} className="w-8 h-8 rounded-full" />
                  )}
                </div>
              )}
              <div className="max-w-[70%]">
                {showSenderInfo && (
                  <p className={`text-xs text-gray-400 mb-1 ml-2 font-semibold inline-block p-1 rounded-md ${isTopUser ? 'fireworks-border' : ''}`}>{msg.sender.username}</p>
                )}
                <div className={`${isSticker ? '' : `p-3 rounded-2xl ${isSentByMe ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-zinc-700 text-gray-200 rounded-bl-lg'}`}`}>
                  {renderMessageContent(msg, isTopUser && !isSentByMe)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput 
        onSendMessage={onSendMessage} 
        userStickers={userStickers}
        onOpenStickerCreator={onOpenStickerCreator}
        aiSuggestions={aiSuggestions}
        isLoadingAiSuggestions={isLoadingSuggestions}
      />
    </div>
  );
};

export default ChatScreen;
