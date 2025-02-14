import "./ProfilePerformance.css";

interface Performance {
    winRate: number;
    totalPnL: number;
    monthlyReturn: number;
    totalTrades: number;
}

interface ProfilePerformanceProps {
    performance: Performance;
}

const ProfilePerformance = ({ performance }: ProfilePerformanceProps) => {
    const { winRate, totalPnL, monthlyReturn, totalTrades } = performance;

    return (
        <div className="profile-performance">
            <div className="profile-performance__stat">
                <span className="profile-performance__label">Win Rate</span>
                <span className="profile-performance__value">
                    {winRate}%
                </span>
            </div>
            <div className="profile-performance__stat">
                <span className="profile-performance__label">Total PnL</span>
                <span className={`profile-performance__value profile-performance__value--${totalPnL > 0 ? 'positive' : 'negative'}`}>
                    {totalPnL > 0 ? '+' : ''}{totalPnL}%
                </span>
            </div>
            <div className="profile-performance__stat">
                <span className="profile-performance__label">Monthly Return</span>
                <span className={`profile-performance__value profile-performance__value--${monthlyReturn > 0 ? 'positive' : 'negative'}`}>
                    {monthlyReturn > 0 ? '+' : ''}{monthlyReturn}%
                </span>
            </div>
            <div className="profile-performance__stat">
                <span className="profile-performance__label">Total Trades</span>
                <span className="profile-performance__value">
                    {totalTrades}
                </span>
            </div>
        </div>
    );
};

export default ProfilePerformance;
