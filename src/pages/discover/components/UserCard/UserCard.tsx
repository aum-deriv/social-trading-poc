import { FC } from 'react';
import './UserCard.css';
import Button from '@/components/input/Button/Button';
import Trophy from '@/assets/icons/Trophy';
import User from '@/types/user.types';

interface UserCardProps {
  user: Partial<User> & {
    copiers: number;
    totalProfit: number;
    isFollowing: boolean;
    winRate: number;
  };
  rank?: number;
  onFollow: (id: string) => Promise<void>;
}

const UserCard: FC<UserCardProps> = ({ user, onFollow, rank }) => {
  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profit);
  };

  const formatCopiers = (count: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(count);
  };

  return (
    <div className="user-card">
      <div className="user-card__header">
        {rank && (
          <div className="user-card__rank">
            <Trophy />
            {rank}
          </div>
        )}
        <div className="user-card__avatar-container">
          <div className="user-card__avatar-wrapper">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="user-card__avatar-img"
              />
            ) : (
              <div className="user-card__avatar-placeholder">
                {user.username && user.username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <h3 className="user-card__name">{user.username}</h3>
      </div>

      <div className="user-card__cta">
        <div className="user-card__stats">
          <div className="user-card__stat">
            <div className="user-card__stat-label">Copiers</div>
            <div className="user-card__stat-value">{formatCopiers(user.copiers)}</div>
          </div>
          <div className="user-card__stat">
            <div className="user-card__stat-label">Total Profit</div>
            <div className="user-card__stat-value">{formatProfit(Math.abs(user.totalProfit))}</div>
          </div>
        </div>
        <Button
          className="user-card__follow-button"
          onClick={() => onFollow(user.id ?? '')}
          rounded
          variant={user.isFollowing ? 'secondary' : 'primary'}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
