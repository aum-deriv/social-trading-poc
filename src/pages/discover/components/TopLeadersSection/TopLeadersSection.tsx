import { FC } from 'react';
import UserCard from '../UserCard';
import SkeletonCard from '../SkeletonCard';
import '../shared.css';
import './TopLeadersSection.css';

interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

interface TopLeadersSectionProps {
  loading: boolean;
  leaders: Leader[];
}

export const TopLeadersSection: FC<TopLeadersSectionProps> = ({ loading, leaders }) => {
  if (loading) {
    return (
      <>
        <h2 className="section-title">Top 3 Leaders</h2>
        <div className="top-leaders">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} large showRank />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">Top 3 Leaders</h2>
      <div className="top-leaders">
        {leaders.map((leader, index) => (
          <UserCard key={leader.id} user={leader} rank={index + 1} />
        ))}
      </div>
    </>
  );
};
