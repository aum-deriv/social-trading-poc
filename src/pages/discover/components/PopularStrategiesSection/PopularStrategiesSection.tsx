import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import type { ExtendedStrategy } from '@/types/strategy.types';
import '../shared.css';

interface PopularStrategiesProps {
  strategies: ExtendedStrategy[];
  onCopy: (strategyId: string) => Promise<void>;
}

const PopularStrategiesSection: FC<PopularStrategiesProps> = ({ strategies, onCopy }) => {
  const navigate = useNavigate();

  return (
    <div className="strategies-grid">
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

export default PopularStrategiesSection;
