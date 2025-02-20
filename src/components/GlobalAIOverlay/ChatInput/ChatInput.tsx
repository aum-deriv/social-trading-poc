import AISearchBar from '@/components/AISearchBar';
import './ChatInput.css';

interface ChatInputProps {
  isLoading?: boolean;
  onSubmit: (query: string) => void;
}

const ChatInput = ({ isLoading, onSubmit }: ChatInputProps) => (
  <div className="chat-input">
    <AISearchBar isLoading={isLoading} placeholder="Ask Champion AI" onSearch={onSubmit} />
  </div>
);

export default ChatInput;
