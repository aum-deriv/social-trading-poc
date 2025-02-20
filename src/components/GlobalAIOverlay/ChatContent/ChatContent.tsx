import ChatMessage from '@/components/ChatMessage';
import { createRef } from 'react';
import ThinkingLoader from '../ThinkingLoader';
import DataAttachments from '../DataAttachments';
import { ChatMessage as ChatMessageType } from '@/types/ai.types';
import './ChatContent.css';

interface ChatContentProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

const ChatContent = ({ messages, isLoading, hasError, onRetry }: ChatContentProps) => (
  <div className="chat-content">
    {messages.map((msg, index) => (
      <div key={msg.id} className="chat-content__message">
        <ChatMessage
          ref={index === messages.length - 1 ? createRef() : null}
          scrollIntoView={index === messages.length - 1}
          from={msg.from}
          message={msg.message}
          navigation={msg.type === 'ai' ? msg.navigation : undefined}
        />
        {msg.type === 'ai' && msg.data && <DataAttachments data={msg.data} />}
      </div>
    ))}
    {isLoading && <ThinkingLoader />}
    {hasError && (
      <div className="chat-content__error">
        <div className="chat-content__error-message">
          Sorry, I encountered an error. Please try again.
        </div>
        <button className="chat-content__retry-button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )}
  </div>
);

export default ChatContent;
