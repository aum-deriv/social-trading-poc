import Table from '@/components/Table';
import { Contract } from '@/types/contract.types';
import { useTradePositionsDataMapper } from '../../hooks';
import { ContractCard } from './ContractCard';
import { useViewport } from '@/hooks';
import { BREAKPOINTS } from '@/constants';
import { TradeType } from '../../types';
import './TradePositions.css';

interface PositionsTableProps {
  contracts: Contract[];
  tradeType: TradeType;
}

const TradePositions = ({ contracts, tradeType }: PositionsTableProps) => {
  const data = useTradePositionsDataMapper(contracts, tradeType);
  const { width } = useViewport();

  return width >= BREAKPOINTS.DESKTOP ? (
    <Table data={data} />
  ) : (
    <div className="contract-card-container">
      {data.map((item, index) => {
        const items = Object.entries(item)
          .map(([key, value]) => ({
            title: key,
            value,
          }))
          .filter(item => item.title !== 'Type');
        const contract = contracts.find(contract => contract.contract_id === item['Ref. ID']);
        return <ContractCard items={items} contract={contract} key={index} />;
      })}
    </div>
  );
};

export default TradePositions;
