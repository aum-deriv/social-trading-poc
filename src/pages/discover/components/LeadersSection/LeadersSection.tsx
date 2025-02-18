import { useMemo } from 'react';
import LeaderCard from '../LeaderCard';
import SkeletonCard from '../SkeletonCard';
import SuggestedLeadersSection from '../SuggestedLeadersSection/SuggestedLeadersSection';

interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

interface LeadersSectionProps {
  loading: boolean;
  leaders: Leader[];
  onFollow: (leaderId: string) => Promise<void>;
}

export default function LeadersSection({ loading, leaders, onFollow }: LeadersSectionProps) {
  // Memoized sections
  const topLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 3);
  }, [leaders]);

  const topEarners = useMemo(() => {
    return [...leaders].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5);
  }, [leaders]);

  const mostPopular = useMemo(() => {
    return [...leaders].sort((a, b) => b.copiers - a.copiers).slice(0, 5);
  }, [leaders]);

  if (loading) {
    return (
      <>
        <h2 className="discover__section-title">Top 3 Leaders</h2>
        <div className="discover__top-leaders">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} large showRank />
          ))}
        </div>

        <h2 className="discover__section-title">Top Earners</h2>
        <div className="discover__leaders-grid">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={`earners-${index}`} />
          ))}
        </div>

        <h2 className="discover__section-title">Most Popular</h2>
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
      <h2 className="discover__section-title">Top 3 Leaders</h2>
      <div className="discover__top-leaders">
        {topLeaders.map((leader, index) => (
          <LeaderCard key={leader.id} leader={leader} rank={index + 1} onFollow={onFollow} large />
        ))}
      </div>

      <h2 className="discover__section-title">AI Suggested Leaders</h2>
      <SuggestedLeadersSection onFollow={onFollow} />

      <h2 className="discover__section-title">Top Earners</h2>
      <div className="discover__leaders-grid">
        {topEarners.map(leader => (
          <LeaderCard key={leader.id} leader={leader} onFollow={onFollow} />
        ))}
      </div>

      <h2 className="discover__section-title">Most Popular</h2>
      <div className="discover__leaders-grid">
        {mostPopular.map(leader => (
          <LeaderCard key={leader.id} leader={leader} onFollow={onFollow} />
        ))}
      </div>
    </>
  );
}
