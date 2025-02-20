import React from 'react';
import './AILoader.css';
import aiLoaderSvg from '../../assets/icons/ai-loader.svg';

interface AILoaderProps {
  size?: number;
  className?: string;
  symbol?: string;
  title?: string;
  showText?: boolean;
  variant?: 'default' | 'card';
}

const AILoader: React.FC<AILoaderProps> = ({
  size = 60,
  className = '',
  symbol,
  title,
  showText = true,
  variant = 'default',
}) => {
  const containerClass = variant === 'card' ? 'ai-loader--card' : 'ai-loader';

  return (
    <div className={`${containerClass} ${className}`}>
      {(symbol || title) && (
        <div className="ai-loader__header">
          <span className="ai-loader__text--title">{symbol || title}</span>
        </div>
      )}
      <div className="ai-loader__svg-container">
        <img
          src={aiLoaderSvg}
          alt="AI Loading"
          width={size}
          height={size}
          className="ai-loader__svg"
        />
      </div>
      {showText && <div className="ai-loader__text">{title ?? 'Analyzing with AI...'}</div>}
    </div>
  );
};

export default AILoader;
