import Overlay from '@/components/Overlay/Overlay';
import ChatMessage from '@components/ChatMessage/ChatMessage';
import AISearchBar from '@components/AISearchBar/AISearchBar';
import ChampionLogo from '../../../public/champion_logo-white.svg';
import Chip from '../Chip';
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
      header={
        <div className="global-ai-overlay__header">
          <img src={ChampionLogo} width="20px" />
          Champion AI
        </div>
      }
    >
      <div className="global-ai-overlay__content">
        <div className="global-ai-overlay__content-chat">
          <ChatMessage from="aum" message="hi"></ChatMessage>
        </div>
        <div className="global-ai-overlay__content-suggestions">
          <Chip>How can I do social trading?</Chip>
          <Chip>Who are the top leaders?</Chip>
          <Chip>What are the best trading strategies?</Chip>
        </div>
        <div className="global-ai-overlay__content-chat-input">
          <AISearchBar placeholder="Ask Champion AI" />
        </div>
      </div>
    </Overlay>
  );
};

export default GlobalAIOverlay;
