import { useMemo, useState } from 'react';
import '../shared.css';
import './StrategiesSection.css';
import SkeletonCard from '../SkeletonCard';
import Chip from '@/components/Chip';
import type { ExtendedStrategy } from '@/types/strategy.types';
import TopStrategiesSection from '../TopStrategiesSection';
import AIStrategiesSection from '../AIStrategiesSection';
import PopularStrategiesSection from '../PopularStrategiesSection';

interface StrategiesSectionProps {
  loading: boolean;
  strategies: ExtendedStrategy[];
  onCopy: (strategyId: string) => Promise<void>;
}

export default function StrategiesSection({ loading, strategies, onCopy }: StrategiesSectionProps) {
  // Strategy sections
  const topStrategies = useMemo(() => {
    return strategies.slice(0, 3);
  }, [strategies]);

  const aiSuggestedStrategies = useMemo(() => {
    return strategies.slice(3, 8);
  }, [strategies]);

  const popularStrategies = useMemo(() => {
    return strategies.slice(8, 13);
  }, [strategies]);

  type StrategyTab = 'top' | 'ai' | 'popular';
  const [activeTab, setActiveTab] = useState<StrategyTab>('top');

  if (loading) {
    return (
      <div className="strategies-section">
        <div className="strategies-section__tabs">
          <Chip active={activeTab === 'top'} onClick={() => setActiveTab('top')}>
            Top Strategies
          </Chip>
          <Chip active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
            AI Suggested
          </Chip>
          <Chip active={activeTab === 'popular'} onClick={() => setActiveTab('popular')}>
            Popular
          </Chip>
        </div>

        <h2 className="section-title">
          {activeTab === 'top'
            ? 'Top Strategies'
            : activeTab === 'ai'
              ? 'AI Suggested Strategies'
              : 'Popular Strategies'}
        </h2>
        <div className="strategies-grid">
          {[...Array(activeTab === 'top' ? 3 : 5)].map((_, index) => (
            <SkeletonCard key={index} large={activeTab === 'top'} showRank={activeTab === 'top'} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="strategies-section">
      <div className="strategies-section__tabs">
        <Chip active={activeTab === 'top'} onClick={() => setActiveTab('top')}>
          Top Strategies
        </Chip>
        <Chip active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
          ✧ AI Suggested
        </Chip>
        <Chip active={activeTab === 'popular'} onClick={() => setActiveTab('popular')}>
          Popular
        </Chip>
      </div>
      {activeTab === 'top' && <TopStrategiesSection strategies={topStrategies} onCopy={onCopy} />}
      {activeTab === 'ai' && (
        <AIStrategiesSection strategies={aiSuggestedStrategies} onCopy={onCopy} />
      )}
      {activeTab === 'popular' && (
        <PopularStrategiesSection strategies={popularStrategies} onCopy={onCopy} />
      )}
    </div>
  );
}
