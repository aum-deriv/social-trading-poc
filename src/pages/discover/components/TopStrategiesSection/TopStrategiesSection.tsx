import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import type { ExtendedStrategy } from '@/types/strategy.types';
import '../shared.css';
import './TopStrategiesSection.css';

interface TopStrategiesProps {
  strategies: ExtendedStrategy[];
  onCopy: (strategyId: string) => Promise<void>;
}

const TopStrategiesSection: FC<TopStrategiesProps> = ({ strategies, onCopy }) => {
  const navigate = useNavigate();

  return (
    <div className="top-strategies">
      <h2 className="section-title">Top Strategies</h2>
      {strategies.map((strategy, index) => (
        <StrategyListItem
          key={strategy.id}
          strategy={strategy}
          rank={index + 1}
          showCopyButton={true}
          isCopying={strategy.isCopying}
          onCopy={onCopy}
          onClick={id => navigate(`/strategies/${id}`)}
        />
      ))}
    </div>
  );
};

export default TopStrategiesSection;
