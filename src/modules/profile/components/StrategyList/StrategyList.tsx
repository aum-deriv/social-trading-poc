import { useNavigate } from "react-router-dom";
import type { Strategy } from "@/types/strategy.types";
import Button from "@/components/input/Button";
import "./StrategyList.css";

interface StrategyListProps {
    strategies: Strategy[];
    onCopyStrategy?: (strategyId: string) => Promise<void>;
}

const StrategyList = ({ strategies, onCopyStrategy }: StrategyListProps) => {
    const navigate = useNavigate();

    return (
        <div className="strategy-list">
            {strategies.map((strategy) => (
                <div key={strategy.id} className="strategy-list__item">
                    <div className="strategy-list__info">
                        <div className="strategy-list__header">
                            <h3 className="strategy-list__name">{strategy.name}</h3>
                            <span className="strategy-list__copiers">
                                {strategy.copiers?.length || 0} copiers
                            </span>
                        </div>
                        <p className="strategy-list__description">{strategy.description}</p>
                        <div className="strategy-list__stats">
                            <div className="strategy-list__stat">
                                <span className="strategy-list__stat-label">Win Rate</span>
                                <span className="strategy-list__stat-value">
                                    {strategy.winRate}%
                                </span>
                            </div>
                            <div className="strategy-list__stat">
                                <span className="strategy-list__stat-label">Total PnL</span>
                                <span className="strategy-list__stat-value">
                                    {strategy.totalPnL > 0 ? "+" : ""}{strategy.totalPnL}%
                                </span>
                            </div>
                        </div>
                    </div>
                    {onCopyStrategy && (
                        <Button
                            onClick={() => onCopyStrategy(strategy.id)}
                            variant="primary"
                        >
                            Copy Strategy
                        </Button>
                    )}
                </div>
            ))}
            {strategies.length === 0 && (
                <div className="strategy-list--empty">
                    No strategies found
                </div>
            )}
        </div>
    );
};

export default StrategyList;
