import { useMemo } from 'react';
import { TopLeadersSection } from '../TopLeadersSection';
import SuggestedLeadersSection from '../SuggestedLeadersSection';
import './LeadersSection.css';

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
}

export default function LeadersSection({ loading, leaders }: LeadersSectionProps) {
  // Memoized top leaders
  const topLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 3);
  }, [leaders]);

  return (
    <div className="leaders-section">
      <TopLeadersSection loading={loading} leaders={topLeaders} />
      <SuggestedLeadersSection />
    </div>
  );
}
