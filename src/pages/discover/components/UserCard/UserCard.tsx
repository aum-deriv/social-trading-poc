import { FC, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './UserCard.css';
import Button from '@/components/input/Button/Button';
import Trophy from '@/assets/icons/Trophy';
import User from '@/types/user.types';
import { toggleUserFollow } from '@/services/userService';

interface UserCardProps {
  user: Partial<User> & {
    copiers: number;
    totalProfit: number;
    isFollowing: boolean;
    winRate: number;
  };
  rank?: number;
}

const UserCard: FC<UserCardProps> = ({ user, rank }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCardClick = () => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
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
      // Could add toast notification here
    } finally {
      setLoading(false);
    }
  };
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
    <div className="user-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
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
