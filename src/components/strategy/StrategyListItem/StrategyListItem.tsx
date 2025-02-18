import { FC } from 'react';
import type { Strategy } from '@/types/strategy.types';

interface ExtendedStrategy extends Strategy {
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
}
import Trophy from '@/assets/icons/Trophy';
import './StrategyListItem.css';

interface StrategyListItemProps {
  strategy: ExtendedStrategy;
  showCopyButton?: boolean;
  isCopying?: boolean;
  onCopy?: (strategyId: string, isCopying: boolean) => void;
  onClick?: (strategyId: string) => void;
  rank?: number;
}

const StrategyListItem: FC<StrategyListItemProps> = ({
  strategy,
  showCopyButton = true,
  isCopying = false,
  onCopy,
  onClick,
  rank,
}) => {
  const getRiskLevelClass = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    return `strategy-list__risk strategy-list__risk--${level}`;
  };

  return (
    <div
      className={`strategy-list__item ${rank ? 'strategy-list__item--ranked' : ''}`}
      onClick={() => onClick?.(strategy.id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="strategy-list__header">
        <div className="strategy-list__header-main">
          <div className="strategy-list__title">
            <h4>{strategy.name}</h4>
            {strategy.leader && (
              <span className="strategy-list__username">by @{strategy.leader.username}</span>
            )}
          </div>
          {showCopyButton && onCopy && (
            <button
              className={`strategy-list__copy-btn ${
                isCopying
                  ? 'strategy-list__copy-btn--secondary'
                  : 'strategy-list__copy-btn--primary'
              }`}
              onClick={e => {
                e.stopPropagation(); // Prevent navigation when clicking the button
                onCopy(strategy.id, isCopying);
              }}
            >
              {isCopying ? 'Stop Copying' : 'COPY'}
            </button>
          )}
        </div>
        <p className="strategy-list__description">{strategy.description}</p>
      </div>

      <div className="strategy-list__stats">
        <div className="strategy-list__stat-item">
          <span
            className="strategy-list__stat-value"
            style={{
              color: strategy.performance.totalReturn > 0 ? '#059669' : '#dc2626',
            }}
          >
            {strategy.performance.totalReturn > 0 ? '+' : ''}
            {strategy.performance.totalReturn}%
          </span>
          <span className="strategy-list__stat-label">Total Return</span>
        </div>
        <div className="strategy-list__stat-item">
          <span className="strategy-list__stat-value">{strategy.performance.winRate}%</span>
          <span className="strategy-list__stat-label">Win Rate</span>
        </div>
        <div className="strategy-list__stat-item">
          <span className="strategy-list__stat-value">{strategy.performance.averageProfit}%</span>
          <span className="strategy-list__stat-label">Avg. Profit</span>
        </div>
        <div className="strategy-list__stat-item">
          <span className="strategy-list__stat-value">{strategy.copiers.length}</span>
          <span className="strategy-list__stat-label">Copiers</span>
        </div>
      </div>

      <div className="strategy-list__meta">
        <span className={getRiskLevelClass(strategy.riskLevel)}>{strategy.riskLevel} Risk</span>
        {rank && (
          <div className="strategy-list__rank">
            <Trophy className="strategy-list__trophy" />#{rank}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyListItem;
