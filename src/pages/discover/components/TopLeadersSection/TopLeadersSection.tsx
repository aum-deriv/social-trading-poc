import { FC, useEffect, useState } from 'react';
import UserCard from '../UserCard';
import SkeletonUserCard from '../SkeletonUserCard';
import '../shared.css';

interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

export const TopLeadersSection: FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopLeaders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_LLM_SERVER_URL}/api/top-leaders`);
        const data = await response.json();
        setLeaders(data);
      } catch (error) {
        console.error('Error fetching top leaders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopLeaders();
  }, []);

  if (loading) {
    return (
      <>
        <h2 className="section-title">Top 3 Leaders</h2>
        <div className="leaders-grid">
          {[...Array(3)].map((_, index) => (
            <SkeletonUserCard key={index} rank={index + 1} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">Top 3 Leaders</h2>
      <div className="leaders-grid">
        {leaders.map((leader, index) => (
          <UserCard key={leader.id} user={leader} rank={index + 1} />
        ))}
      </div>
    </>
  );
};
