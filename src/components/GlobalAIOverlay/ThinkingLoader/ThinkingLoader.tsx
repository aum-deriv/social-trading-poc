import './ThinkingLoader.css';

interface ThinkingLoaderProps {
  text?: string;
  className?: string;
}

const ThinkingLoader = ({
  text = 'Champion AI is thinking...',
  className,
}: ThinkingLoaderProps) => <div className={`thinking-loader ${className || ''}`}>{text}</div>;

export default ThinkingLoader;
