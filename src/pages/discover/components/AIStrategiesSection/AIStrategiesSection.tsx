import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import type { ExtendedStrategy } from '@/types/strategy.types';
import '../shared.css';
import './AIStrategiesSection.css';

interface AIStrategiesProps {
  strategies: ExtendedStrategy[];
  onCopy: (strategyId: string) => Promise<void>;
}

const AIStrategiesSection: FC<AIStrategiesProps> = ({ strategies, onCopy }) => {
  const navigate = useNavigate();

  return (
    <div className="strategies-grid">
      <h2 className="section-title">✧ AI Suggested Strategies</h2>
      {strategies.map(strategy => (
        <StrategyListItem
          key={strategy.id}
          strategy={strategy}
          showCopyButton={true}
          isCopying={strategy.isCopying}
          onCopy={onCopy}
          onClick={id => navigate(`/strategies/${id}`)}
        />
      ))}
    </div>
  );
};

export default AIStrategiesSection;
