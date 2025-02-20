import { useState, useEffect } from 'react';
import Chip from '@/components/Chip';
import { TradePositions } from './components/TradePositions';
import { TradeType } from './types';
import { contractService, ContractResponse } from '@/services/contractService';
import AILoader from '@/components/AILoader';
import ErrorState from '@/components/feedback/ErrorState';
import './OpenPositions.css';

const OpenPositions = () => {
  const [selectedTradeType, setSelectedTradeType] = useState<TradeType>(TradeType.Accumulators);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await contractService.getContracts(selectedTradeType, abortController.signal);
        setContracts(data);
        setError(null);
      } catch (err) {
        // Only set error if it's not an abort error
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to fetch contracts');
          console.error('Error:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchContracts();

    return () => {
      abortController.abort(); // Cleanup on unmount or when selectedTradeType changes
    };
  }, [selectedTradeType]);

  const handleTradeTypeChange = (selected: string) => {
    setSelectedTradeType(selected as TradeType);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="open-positions-loader">
          <AILoader />
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (contracts.length === 0) {
      return (
        <ErrorState
          message={`No open positions found for ${selectedTradeType}. Try selecting a different trade type or check back later.`}
        />
      );
    }

    return <TradePositions contracts={contracts} tradeType={selectedTradeType} />;
  };

  return (
    <div className="open-positions">
      <div className="open-positions-header">
        <div className="open-positions-tabs">
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

export default OpenPositions;
