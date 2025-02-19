import { BaseContract, MultiplierContract } from '@/types/contract.types';
import { useTradePositionsDataMapper } from '../../hooks';
import { TradeType } from '../../types';
import './TradePositions.css';
import MultiplierOpenPosition from '../MultiplierOpenPosition';
import OptionOpenPosition from '../OptionOpenPosition';
import AccumulatorOpenPosition from '../AccumulatorOpenPosition';

interface PositionsTableProps {
  contracts: MultiplierContract[] & BaseContract[];
  tradeType: TradeType;
}

const TradePositions = ({ contracts, tradeType }: PositionsTableProps) => {
  const { multiplierContracts, optionContracts, accumulatorContracts, removeContract } =
    useTradePositionsDataMapper(contracts);

  const renderContracts = () => {
    if (tradeType === TradeType.Multipliers) {
      return multiplierContracts.map(contract => (
        <MultiplierOpenPosition {...contract} onClose={removeContract} key={contract.contractId} />
      ));
    }

    if (tradeType === TradeType.Accumulators) {
      return accumulatorContracts.map(contract => (
        <AccumulatorOpenPosition {...contract} onSell={removeContract} key={contract.contractId} />
      ));
    }

    return optionContracts.map(contract => (
      <OptionOpenPosition {...contract} onSell={removeContract} key={contract.contractId} />
    ));
  };

  return <div className="contract-card-container">{renderContracts()}</div>;
};

export default TradePositions;
