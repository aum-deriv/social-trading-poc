import { useMemo } from 'react';
import StrategyCard from '../StrategyCard';
import SkeletonCard from '../SkeletonCard';

interface Strategy {
  id: string;
  leaderId: string;
  accountId: string;
  name: string;
  description: string;
  tradeType: string;
  copiers: string[];
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  currency?: string;
  isFollowing?: boolean;
  isCopying?: boolean;
}

interface StrategiesSectionProps {
  loading: boolean;
  strategies: Strategy[];
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

  if (loading) {
    return (
      <>
        <h2 className="discover__section-title">Top Strategies</h2>
        <div className="discover__top-leaders">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} large showRank />
          ))}
        </div>

        <h2 className="discover__section-title">AI Suggested Strategies</h2>
        <div className="discover__leaders-grid">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={`ai-${index}`} />
          ))}
        </div>

        <h2 className="discover__section-title">Popular Strategies</h2>
        <div className="discover__leaders-grid">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={`popular-${index}`} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="discover__section-title">Top Strategies</h2>
      <div className="discover__top-leaders">
        {topStrategies.map((strategy, index) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            rank={index + 1}
            onCopy={onCopy}
            large
          />
        ))}
      </div>

      <h2 className="discover__section-title">AI Suggested Strategies</h2>
      <div className="discover__leaders-grid">
        {aiSuggestedStrategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} onCopy={onCopy} />
        ))}
      </div>

      <h2 className="discover__section-title">Popular Strategies</h2>
      <div className="discover__leaders-grid">
        {popularStrategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} onCopy={onCopy} />
        ))}
      </div>
    </>
  );
}
