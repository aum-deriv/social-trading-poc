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

  const [lastQuery, setLastQuery] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  const sendQuery = async (query: string, addUserMessage = true) => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Add user message only for new queries
      if (addUserMessage) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          from: user?.displayName ?? 'User',
          message: query,
          timestamp: new Date(),
          type: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
      }

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
      setLastQuery(''); // Clear lastQuery on success
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setHasError(true);
      setLastQuery(query); // Cache query only on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = (query: string) => sendQuery(query, true);
  const handleRetry = () => lastQuery && sendQuery(lastQuery, false);

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
        <ChatContent
          messages={messages}
          isLoading={isLoading}
          hasError={hasError}
          onRetry={handleRetry}
        />
        {!messages.length && <Suggestions suggestions={suggestions} onSelect={handleQuery} />}
        <ChatInput isLoading={isLoading} onSubmit={handleQuery} />
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
