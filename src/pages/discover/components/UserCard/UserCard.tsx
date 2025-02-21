import { FC, useState, MouseEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import './UserCard.css';
import Button from '@/components/input/Button/Button';
import Trophy from '@/assets/icons/Trophy';
import type User from '@/types/user.types';
import { toggleUserFollow } from '@/services/userService';

export interface ExtendedUser extends Partial<User> {
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
  matchScore?: number;
  matchReason?: string;
  profilePicture?: string;
}

interface UserCardProps {
  user: ExtendedUser;
  rank?: number;
  context?: 'leaders' | 'people';
}

const UserCard: FC<UserCardProps> = ({ user, rank, context }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [loading, setLoading] = useState(false);

  const handleCardClick = () => {
    if (user.username) {
      window.location.href = `/profile/${user.username}`;
    }
  };

  const handleFollow = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id || !user.id) return;

    try {
      setLoading(true);
      const newFollowingStatus = await toggleUserFollow(user.id, currentUser.id);
      setIsFollowing(newFollowingStatus);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatProfit = (profit: number | undefined) => {
    if (profit === undefined || isNaN(profit)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profit);
  };

  return (
    <div className="user-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="user-card__header">
        {rank && (
          <div className="user-card__rank">
            <Trophy />
            {rank}
          </div>
        )}
        <div className="user-card__avatar-container">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} className="user-card__avatar-img" />
          ) : (
            <div className="user-card__avatar-placeholder">
              {user.username?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-card__details">
          <h3 className="user-card__name">{user.displayName || user.username}</h3>
          <h5 className="user-card__username">@{user.username}</h5>
          {user.userType === 'leader' && (
            <span className="user-card__type user-card__type--leader">{user.userType}</span>
          )}
        </div>
      </div>

      <div className="user-card__cta">
        <div className="user-card__stats">
          <div className="user-card__stat">
            <div className="user-card__stat-label">
              {context === 'leaders' ? 'Copiers - ' : 'Followers - '}
            </div>
            <div className="user-card__stat-value">
              {context === 'leaders' ? user.copiers : user.followers?.length}
            </div>
          </div>
          <div className="user-card__stat">
            <div className="user-card__stat-label">Total Profit - </div>
            <div className="user-card__stat-value">
              {formatProfit(user.totalProfit ?? user.performance?.totalPnL)}
            </div>
          </div>
        </div>
        <Button
          className="user-card__follow-button"
          onClick={handleFollow}
          rounded
          variant={isFollowing ? 'secondary' : 'primary'}
          isLoading={loading}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
