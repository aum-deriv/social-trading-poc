import ChatMessage from '@/components/ChatMessage';
import ThinkingLoader from '../ThinkingLoader';
import './ChatContent.css';

interface Message {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

interface ChatContentProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatContent = ({ messages, isLoading }: ChatContentProps) => (
  <div className="chat-content">
    {messages.map(msg => (
      <ChatMessage key={msg.id} from={msg.from} message={msg.message} />
    ))}
    {isLoading && <ThinkingLoader />}
  </div>
);

export default ChatContent;
