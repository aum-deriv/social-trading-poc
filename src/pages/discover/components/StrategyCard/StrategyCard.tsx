import { FC } from "react";
import Tick from "../../../../assets/icons/Tick";
import Trophy from "../../../../assets/icons/Trophy";
import "../LeaderCard/LeaderCard.css";
import PlusIcon from "@/assets/icons/PlusIcon";

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
  onFollow: (id: string) => void;
  onCopy: (id: string) => void;
  large?: boolean;
}

const StrategyCard: FC<StrategyCardProps> = ({
  strategy,
  rank,
  onFollow,
  onCopy,
  large,
}) => {
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
            {strategy.leader?.profilePicture ? (
              <img
                src={strategy.leader.profilePicture}
                alt={strategy.leader.displayName}
                className="leader-card__avatar-img"
              />
            ) : (
              <div className="leader-card__avatar-placeholder">
                {strategy.leader?.displayName.slice(0, 2).toUpperCase() || "ST"}
              </div>
            )}
            <button
              className="leader-card__follow-icon"
              onClick={() => onFollow(strategy.leaderId)}
            >
              {strategy.isFollowing ? <Tick /> : <PlusIcon />}
            </button>
          </div>
        </div>
      </div>
      <div className="leader-card__info">
        <h3 className="leader-card__name">{strategy.name}</h3>
        <p className="leader-card__leader-name">
          {strategy.leader?.displayName}
        </p>
        <span className="leader-card__trade-type">
          {strategy.tradeType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </span>
        <button
          className={`leader-card__copy-button ${
            strategy.isCopying ? "leader-card__copy-button--copied" : ""
          }`}
          onClick={() => onCopy(strategy.id)}
        >
          {strategy.isCopying ? "Stop Copying" : "Copy Strategy"}
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
