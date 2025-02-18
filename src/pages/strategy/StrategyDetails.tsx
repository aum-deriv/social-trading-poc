import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackIcon from '@/assets/icons/BackIcon';
import { getStrategy } from '@/modules/strategy/services/strategyService';
import type Strategy from '@/types/strategy.types';
import ErrorState from '@/components/feedback/ErrorState';
import AILoader from '@/components/AILoader';
import './StrategyDetails.css';

const StrategyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        if (!id) throw new Error('Strategy ID is required');
        const data = await getStrategy(id);
        setStrategy(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load strategy');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [id]);

  if (loading) return <AILoader />;
  if (error) return <ErrorState message={error} />;
  if (!strategy) return <ErrorState message="Strategy not found" />;

  return (
    <div className="strategy-details">
      <div className="strategy-details__header">
        <div className="strategy-details__header-row">
          <button className="strategy-details__back-button" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 className="strategy-details__title">{strategy.name}</h1>
        </div>
        <div className="strategy-details__risk-level">
          Risk Level:{' '}
          <span className={`risk-level risk-level--${strategy.riskLevel}`}>
            {strategy.riskLevel}
          </span>
        </div>
      </div>

      <div className="strategy-details__section">
        <h2 className="strategy-details__section-title">Description</h2>
        <p className="strategy-details__description">{strategy.description}</p>
      </div>

      <div className="strategy-details__section">
        <h2 className="strategy-details__section-title">Performance</h2>
        <div className="strategy-details__performance">
          <div className="strategy-details__performance-stat">
            <span className="strategy-details__performance-label">Total Return</span>
            <span
              className={`strategy-details__performance-value strategy-details__performance-value--${strategy.performance.totalReturn > 0 ? 'positive' : 'negative'}`}
            >
              {strategy.performance.totalReturn > 0 ? '+' : ''}
              {strategy.performance.totalReturn}%
            </span>
          </div>
          <div className="strategy-details__performance-stat">
            <span className="strategy-details__performance-label">Win Rate</span>
            <span className="strategy-details__performance-value">
              {strategy.performance.winRate}%
            </span>
          </div>
          <div className="strategy-details__performance-stat">
            <span className="strategy-details__performance-label">Average Profit</span>
            <span
              className={`strategy-details__performance-value strategy-details__performance-value--${strategy.performance.averageProfit > 0 ? 'positive' : 'negative'}`}
            >
              {strategy.performance.averageProfit > 0 ? '+' : ''}
              {strategy.performance.averageProfit}%
            </span>
          </div>
          <div className="strategy-details__performance-stat">
            <span className="strategy-details__performance-label">Copiers</span>
            <span className="strategy-details__performance-value">{strategy.copiers.length}</span>
          </div>
        </div>
      </div>

      <div className="strategy-details__section">
        <h2 className="strategy-details__section-title">Trading Information</h2>
        <div className="strategy-details__info">
          <div className="strategy-details__info-item">
            <span className="strategy-details__info-label">Trade Type</span>
            <span
              className={`strategy-details__trade-type strategy-details__trade-type--${strategy.tradeType}`}
            >
              {strategy.tradeType
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('/')}
            </span>
          </div>
          <div className="strategy-details__info-item">
            <span className="strategy-details__info-label">Status</span>
            <span
              className={`strategy-details__status strategy-details__status--${strategy.isActive ? 'active' : 'inactive'}`}
            >
              {strategy.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="strategy-details__info-item">
            <span className="strategy-details__info-label">Created</span>
            <span className="strategy-details__info-value">
              {new Date(strategy.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetails;
