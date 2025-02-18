import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Tick from '../../../../assets/icons/Tick';
import Trophy from '../../../../assets/icons/Trophy';
import '../UserCard/UserCard.css';
import PlusIcon from '@/assets/icons/PlusIcon';
import { toggleUserFollow } from '@/services/userService';

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

interface StrategyCardProps {
  strategy: Strategy;
  rank?: number;
  onCopy: (id: string) => void;
  large?: boolean;
}

const StrategyCard: FC<StrategyCardProps> = ({ strategy, rank, onCopy, large }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(strategy.isFollowing ?? false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser?.id || !strategy.leaderId) return;

    try {
      setLoading(true);
      const newFollowingStatus = await toggleUserFollow(strategy.leaderId, currentUser.id);
      setIsFollowing(newFollowingStatus);
    } catch (error) {
      console.error('Error following leader:', error);
      // Could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    navigate(`/strategies/${strategy.id}`);
  };

  const formatCopiers = (count: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(count);
  };

  return (
    <div
      className={`leader-card ${large ? 'leader-card--large' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {rank && (
        <div className="leader-card__rank">
          {rank <= 3 && <Trophy className="leader-card__trophy" />}#{rank}
        </div>
      )}
      <div className="leader-card__banner">
        <div className="leader-card__avatar">
          <div className="leader-card__avatar-wrapper">
            {strategy.leader?.profilePicture ? (
              <img
                src={strategy.leader.profilePicture}
                alt={strategy.leader.displayName}
                className="leader-card__avatar-img"
              />
            ) : (
              <div className="leader-card__avatar-placeholder">
                {strategy.leader?.displayName.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
            <button className="leader-card__follow-icon" onClick={handleFollow} disabled={loading}>
              {isFollowing ? <Tick /> : <PlusIcon />}
            </button>
          </div>
        </div>
      </div>
      <div className="leader-card__info">
        <h3 className="leader-card__name">{strategy.name}</h3>
        <p className="leader-card__leader-name">{strategy.leader?.displayName}</p>
        <span className="leader-card__trade-type">
          {strategy.tradeType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </span>
        <button
          className={`leader-card__copy-button ${
            strategy.isCopying ? 'leader-card__copy-button--copied' : ''
          }`}
          onClick={() => onCopy(strategy.id)}
        >
          {strategy.isCopying ? 'Stop Copying' : 'Copy Strategy'}
        </button>
        <div className="leader-card__stats">
          <div className="leader-card__stat">
            <span className="leader-card__stat-label">Currency</span>
            <span className="leader-card__stat-value">{strategy.currency}</span>
          </div>
          <div className="leader-card__stat">
            <span className="leader-card__stat-label">Copiers</span>
            <span className="leader-card__stat-value">
              {formatCopiers(strategy.copiers.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
