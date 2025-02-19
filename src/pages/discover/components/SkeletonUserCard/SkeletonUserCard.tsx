import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './SkeletonUserCard.css';

interface SkeletonUserCardProps {
  rank?: number;
}

const SkeletonUserCard: FC<SkeletonUserCardProps> = ({ rank }) => {
  return (
    <div className="skeleton-user-card">
      <div className="skeleton-user-card__header">
        {rank && (
          <div className="skeleton-user-card__rank">
            <Skeleton width={30} height={24} />
          </div>
        )}
        <div className="skeleton-user-card__avatar-container">
          <Skeleton circle width={100} height={100} />
        </div>
        <Skeleton width={120} height={20} />
      </div>

      <div className="skeleton-user-card__cta">
        <div className="skeleton-user-card__stats">
          <div className="skeleton-user-card__stat">
            <Skeleton width={60} height={16} />
            <Skeleton width={40} height={20} />
          </div>
          <div className="skeleton-user-card__stat">
            <Skeleton width={80} height={16} />
            <Skeleton width={100} height={20} />
          </div>
        </div>
        <Skeleton width={100} height={36} borderRadius={18} />
      </div>
    </div>
  );
};

export default SkeletonUserCard;
