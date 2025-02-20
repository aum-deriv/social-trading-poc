import { useState } from 'react';
import Overlay from '@/components/Overlay/Overlay';
import ChampionLogo from '../../../public/champion_logo-white.svg';
import { useAuth } from '@/context/AuthContext';
import ChatContent from './ChatContent';
import Suggestions from './Suggestions';
import ChatInput from './ChatInput';
import './GlobalAIOverlay.css';

interface Message {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

interface GlobalAIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalAIOverlay = ({ isOpen, onClose }: GlobalAIOverlayProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    'How can I do social trading?',
    'Who are the top leaders?',
    'What are the best trading strategies?',
  ];

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    try {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        from: user?.displayName || 'User',
        message: query,
        timestamp: new Date(),
        type: 'user' as const,
      };
      setMessages(prev => [...prev, userMessage]);

      // Call API and add AI response
      const response = await fetch('/api/ai/global/chat', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        from: 'Champion AI',
        message: data.answer,
        timestamp: new Date(),
        type: 'ai' as const,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      className="global-ai-overlay"
      header={
        <div className="global-ai-overlay__header">
          <img src={ChampionLogo} width="20px" />
          Champion AI
        </div>
      }
    >
      <div className="global-ai-overlay__container">
        <ChatContent messages={messages} isLoading={isLoading} />
        <Suggestions suggestions={suggestions} onSelect={handleQuery} />
        <ChatInput onSubmit={handleQuery} />
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
