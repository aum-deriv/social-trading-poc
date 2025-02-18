import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import UserCard from '../UserCard';
import SkeletonCard from '../SkeletonCard';
import ErrorState from '../../../../components/feedback/ErrorState/ErrorState';
import { fetchLeaderSuggestions } from '../../../../services/leaderSuggestionsService';
import { SuggestedLeader } from '../../../../types/leader.types';

export default function SuggestedLeadersSection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestedLeader[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, [user?.id]);

  async function fetchSuggestions() {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { suggestions: leaderSuggestions } = await fetchLeaderSuggestions(user.id);
      setSuggestions(leaderSuggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="discover__leaders-grid">
        {[...Array(5)].map((_, index) => (
          <SkeletonCard key={`ai-${index}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="discover__leaders-grid">
      {suggestions.map(suggestion => (
        <UserCard
          key={suggestion.leaderId}
          user={{
            id: suggestion.leaderId,
            username: suggestion.username,
            profilePicture: suggestion.profilePicture,
            copiers: 0,
            totalProfit: suggestion.performance.totalPnL,
            winRate: suggestion.performance.winRate,
            isFollowing: false,
            displayName: suggestion.displayName,
          }}
        />
      ))}
    </div>
  );
}
