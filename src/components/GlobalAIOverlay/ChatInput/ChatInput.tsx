import AISearchBar from '@/components/AISearchBar';
import './ChatInput.css';

interface ChatInputProps {
  onSubmit: (query: string) => void;
}

const ChatInput = ({ onSubmit }: ChatInputProps) => (
  <div className="chat-input">
    <AISearchBar placeholder="Ask Champion AI" onSearch={onSubmit} />
  </div>
);

export default ChatInput;
