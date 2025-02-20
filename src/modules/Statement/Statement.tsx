import { useState, useEffect } from 'react';
import { StatementCard } from './components/StatementCard';
import Chip from '@/components/Chip';
import { TradeType } from '@/modules/OpenPositions/types';
import { StatementItem, getStatementsByType } from '@/services/statementService';
import AILoader from '@/components/AILoader';
import ErrorState from '@/components/feedback/ErrorState';
import './Statement.css';

const Statement = () => {
  const [selectedTradeType, setSelectedTradeType] = useState<TradeType>(TradeType.Multipliers);
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        setLoading(true);
        const data = await getStatementsByType(selectedTradeType);
        setStatements(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch statements');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [selectedTradeType]);

  const handleTradeTypeChange = (selected: string) => {
    setSelectedTradeType(selected as TradeType);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="statement-loader">
          <AILoader />
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (statements.length === 0) {
      return (
        <ErrorState
          message={`No statements found for ${selectedTradeType}. Try selecting a different trade type or check back later.`}
        />
      );
    }

    return (
      <div className="statement-card-container">
        {statements.map(item => (
          <StatementCard key={item.referenceId} {...item} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="statement-header">
        <div className="statement-tabs">
          {Object.values(TradeType).map(type => (
            <Chip
              key={type}
              active={selectedTradeType === type}
              onClick={() => handleTradeTypeChange(type)}
            >
              {type}
            </Chip>
          ))}
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Statement;
