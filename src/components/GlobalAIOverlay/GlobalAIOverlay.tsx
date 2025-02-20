import Overlay from '@/components/Overlay/Overlay';
import ChatMessage from '@components/ChatMessage/ChatMessage';
import AISearchBar from '@components/AISearchBar/AISearchBar';
import './GlobalAIOverlay.css';

interface GlobalAIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalAIOverlay = ({ isOpen, onClose }: GlobalAIOverlayProps) => {
  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      className="global-ai-overlay"
      header={<div className="global-ai-overlay__header">Champion AI</div>}
    >
      <div className="global-ai-overlay__content">
        <div className="global-ai-overlay__content-chat">
          <ChatMessage from="aum" message="hi"></ChatMessage>
        </div>
        <div className="global-ai-overlay__content-chat-input">
          <AISearchBar />
        </div>
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
