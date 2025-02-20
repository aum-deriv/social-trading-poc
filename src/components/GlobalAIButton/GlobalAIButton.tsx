import './GlobalAIButton.css';

interface GlobalAIButtonProps {
  onClick: () => void;
}

const GlobalAIButton = ({ onClick }: GlobalAIButtonProps) => {
  return (
    <button className="global-ai-button" onClick={onClick}>
      <div className="global-ai-button__wrapper">
        <span className="global-ai-button__sparkle">✦</span>
        <div className="global-ai-button__particles">
          <span className="particle">•</span>
          <span className="particle">•</span>
          <span className="particle">•</span>
          <span className="particle">•</span>
        </div>
      </div>
    </button>
  );
};

export default GlobalAIButton;
