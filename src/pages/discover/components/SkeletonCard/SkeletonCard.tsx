import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./SkeletonCard.css";

interface SkeletonCardProps {
  large?: boolean;
  showRank?: boolean;
}

const SkeletonCard: FC<SkeletonCardProps> = ({ large, showRank }) => {
  return (
    <div className={`skeleton-card ${large ? "skeleton-card--large" : ""}`}>
      {showRank && (
        <div className="skeleton-card__rank">
          <Skeleton width={60} height={24} borderRadius={16} />
        </div>
      )}
      <div className="skeleton-card__banner">
        <div className="skeleton-card__avatar">
          <Skeleton circle width={large ? 120 : 80} height={large ? 120 : 80} />
        </div>
      </div>
      <div className="skeleton-card__info">
        <Skeleton width={large ? 160 : 120} style={{ marginBottom: "1rem" }} />
        <div className="skeleton-card__stats">
          <div className="skeleton-card__stat">
            <Skeleton width={60} />
            <Skeleton width={60} />
          </div>
          <div className="skeleton-card__stat">
            <Skeleton width={60} />
            <div className="skeleton-card__profit">
              <Skeleton
                width={16}
                height={16}
                style={{ marginRight: "0.5rem" }}
              />
              <Skeleton width={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
