import { BaseContract } from '@/types/contract.types';
import { TradeType } from '../../types';
import './TradePositions.css';
import { OpenPositionCard } from '../OpenPositionCard/OpenPositionCard';

interface PositionsTableProps {
  contracts: BaseContract[];
  tradeType: TradeType;
}

const TradePositions = ({ contracts }: PositionsTableProps) => {
  const handleClose = (contractId: string) => {
    // TODO: Implement contract close logic
    console.log('Closing contract:', contractId);
  };

  return (
    <div className="contract-card-container">
      {contracts.map(contract => (
        <OpenPositionCard
          key={contract.contractId}
          contractId={contract.contractId}
          contractType={contract.contractType}
          symbol={contract.symbol}
          currency={contract.currency}
          stake={contract.stake}
          leaderId={contract.leaderId}
          leaderDisplayName={contract.leader}
          strategyId={contract.strategyId}
          strategyDisplayName={contract.strategyName}
          multiplier={contract.multiplier}
          buyPrice={contract.buyPrice}
          dateStart={contract.dateStart}
          expiryTime={contract.expiryTime}
          payout={contract.payout}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default TradePositions;
