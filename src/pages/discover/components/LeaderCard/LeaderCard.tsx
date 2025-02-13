import { FC } from "react";
import Tick from "../../../../assets/icons/Tick";
import Plus from "../../../../assets/icons/Plus";
import Trophy from "../../../../assets/icons/Trophy";
import ArrowUp from "../../../../assets/icons/ArrowUp";
import ArrowDown from "../../../../assets/icons/ArrowDown";
import "./LeaderCard.css";

interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

interface LeaderCardProps {
  leader: Leader;
  rank?: number;
  onFollow: (id: string) => void;
  large?: boolean;
}

const LeaderCard: FC<LeaderCardProps> = ({ leader, rank, onFollow, large }) => {
  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profit);
  };

  const formatCopiers = (count: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(count);
  };

  return (
    <div className={`leader-card ${large ? "leader-card--large" : ""}`}>
      {rank && (
        <div className="leader-card__rank">
          {rank <= 3 && <Trophy className="leader-card__trophy" />}#{rank}
        </div>
      )}
      <div className="leader-card__banner">
        <div className="leader-card__avatar">
          <div className="leader-card__avatar-wrapper">
            {leader.avatar ? (
              <img
                src={leader.avatar}
                alt={leader.username}
                className="leader-card__avatar-img"
              />
            ) : (
              <div className="leader-card__avatar-placeholder">
                {leader.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <button
              className="leader-card__follow-icon"
              onClick={() => onFollow(leader.id)}
            >
              {leader.isFollowing ? <Tick /> : <Plus />}
            </button>
          </div>
        </div>
      </div>
      <div className="leader-card__info">
        <h3 className="leader-card__name">{leader.username}</h3>
        <div className="leader-card__stats">
          <div className="leader-card__stat">
            <span className="leader-card__stat-label">Copiers</span>
            <span className="leader-card__stat-value">
              {formatCopiers(leader.copiers)}
            </span>
          </div>
          <div className="leader-card__stat">
            <span className="leader-card__stat-label">Total Profit</span>
            <div className="leader-card__profit-wrapper">
              {leader.totalProfit >= 700000 ? (
                <ArrowUp className="leader-card__arrow-up" />
              ) : (
                <ArrowDown className="leader-card__arrow-down" />
              )}
              <span className="leader-card__stat-value leader-card__stat-value--profit">
                {formatProfit(Math.abs(leader.totalProfit))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderCard;
