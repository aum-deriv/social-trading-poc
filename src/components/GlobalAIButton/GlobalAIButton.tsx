import './GlobalAIButton.css';

interface GlobalAIButtonProps {
  onClick: () => void;
}

const GlobalAIButton = ({ onClick }: GlobalAIButtonProps) => {
  return (
    <button className="global-ai-button" onClick={onClick}>
      <span className="global-ai-button__icon">✦</span>
    </button>
  );
};

export default GlobalAIButton;
