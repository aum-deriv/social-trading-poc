import { useState } from 'react';
import Overlay from '@/components/Overlay/Overlay';
import ChampionLogo from '../../../public/champion_logo-white.svg';
import { useAuth } from '@/context/AuthContext';
import { globalAIService } from '@/services/globalAIService';
import { ChatMessage } from '@/types/ai.types';
import ChatContent from './ChatContent';
import Suggestions from './Suggestions';
import ChatInput from './ChatInput';
import './GlobalAIOverlay.css';

interface GlobalAIOverlayProps {
  onClose: () => void;
}

const GlobalAIOverlay = ({ onClose }: GlobalAIOverlayProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        from: user?.displayName ?? 'User',
        message: query,
        timestamp: new Date(),
        type: 'user',
      };
      setMessages(prev => [...prev, userMessage]);

      // Call API and add AI response
      const response = await globalAIService.sendQuery(query, user?.id);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'Champion AI',
        message: response.answer,
        timestamp: new Date(),
        type: 'ai',
        data: response.data,
        navigation: response.navigation,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'Champion AI',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Overlay
      isOpen
      onClose={onClose}
      className="global-ai-overlay"
      header={
        <div className="global-ai-overlay__header">
          <img src={ChampionLogo} width="20px" /> Champion AI
        </div>
      }
    >
      <div className="global-ai-overlay__container">
        <ChatContent messages={messages} isLoading={isLoading} />
        {!messages.length && <Suggestions suggestions={suggestions} onSelect={handleQuery} />}
        <ChatInput isLoading={isLoading} onSubmit={handleQuery} />
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
