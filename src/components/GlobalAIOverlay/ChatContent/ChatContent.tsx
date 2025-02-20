import ChatMessage from '@/components/ChatMessage';
import ThinkingLoader from '../ThinkingLoader';
import DataAttachments from '../DataAttachments';
import { ChatMessage as ChatMessageType } from '@/types/ai.types';
import './ChatContent.css';

interface ChatContentProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

const ChatContent = ({ messages, isLoading }: ChatContentProps) => (
  <div className="chat-content">
    {messages.map(msg => (
      <div key={msg.id} className="chat-content__message">
        <ChatMessage
          from={msg.from}
          message={msg.message}
          navigation={msg.type === 'ai' ? msg.navigation : undefined}
        />
        {msg.type === 'ai' && msg.data && <DataAttachments data={msg.data} />}
      </div>
    ))}
    {isLoading && <ThinkingLoader />}
  </div>
);

export default ChatContent;
