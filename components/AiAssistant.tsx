
import React, { useState, useCallback } from 'react';
import { generatePostIdea } from '../services/geminiService';

interface AiAssistantProps {
  onIdeaGenerated: (idea: string) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onIdeaGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [idea, setIdea] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError('');
    setIdea('');
    const result = await generatePostIdea(topic);
    if (result.startsWith('An error occurred') || result.startsWith('AI service is currently unavailable')) {
        setError(result);
    } else {
        setIdea(result);
    }
    setIsLoading(false);
  }, [topic]);

  const handleInsert = () => {
    if (idea) {
      onIdeaGenerated(idea);
      setIdea('');
      setTopic('');
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg mt-4 border border-gray-700">
      <h3 className="text-sm font-bold text-blue-400 mb-2">AI Post Assistant</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., 'sunset')"
          className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-[#0c3a99] hover:bg-[#1049b8] disabled:bg-[#0c3a99]/50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {idea && (
        <div className="mt-3 p-3 bg-gray-900/70 rounded-md border border-gray-700">
          <p className="text-sm whitespace-pre-wrap">{idea}</p>
          <button
            onClick={handleInsert}
            className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors"
          >
            Insert into post
          </button>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
