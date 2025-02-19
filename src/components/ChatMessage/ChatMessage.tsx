import './ChatMessage.css';

interface ChatMessageProps {
  from: string;
  message: string;
  attachments?: React.ReactNode;
}

const ChatMessage = ({ from, message, attachments }: ChatMessageProps) => {
  return (
    <div className="chat-message">
      <div className="chat-message__content">
        <div className="chat-message__from">{from}</div>
        <div className="chat-message__text">{message}</div>
        {attachments && <div className="chat-message__attachments">{attachments}</div>}
      </div>
    </div>
  );
};

export default ChatMessage;
