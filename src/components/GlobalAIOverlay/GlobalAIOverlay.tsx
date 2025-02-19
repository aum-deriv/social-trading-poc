import Overlay from '@/components/Overlay/Overlay';
import ChatMessage from '@components/ChatMessage/ChatMessage';
import './GlobalAIOverlay.css';

interface GlobalAIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalAIOverlay = ({ isOpen, onClose }: GlobalAIOverlayProps) => {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} className="global-ai-overlay">
      <div className="global-ai-overlay__content">
        <ChatMessage from="aum" message="hi"></ChatMessage>
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
