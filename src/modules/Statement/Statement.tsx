import Table from '../../components/Table/Table';
import dbData from '../../../json-server/data/db.json';
import { formatTimestamp } from '@/utils';
import { useViewport } from '@/hooks';
import { BREAKPOINTS } from '@/constants';
import { ContractCard } from '../OpenPositions/components/TradePositions/ContractCard';

interface StatementItem {
  type: string;
  reference_id: string | number;
  currency: string;
  transaction_time: string;
  action_type: string;
  amount: number;
  balance_after: number;
}

const Statement = () => {
  const statements = (dbData.statements || []) as StatementItem[];
  const { width } = useViewport();

  // Map each statement object to an array of values matching the column order
  const data = statements.map((statement: StatementItem) => ({
    Type: statement.type,
    'Ref. ID': statement.reference_id,
    Currency: statement.currency,
    'Transaction time': formatTimestamp(statement.transaction_time.toString()),
    Transaction: statement.action_type,
    'Credit/Debit': statement.amount,
    Balance: statement.balance_after,
  }));

  return width >= BREAKPOINTS.DESKTOP ? (
    <Table data={data} />
  ) : (
    <div className="contract-card-container">
      {data.map((item, index) => {
        const items = Object.entries(item).map(([key, value]) => ({
          title: key,
          value,
        }));

        return <ContractCard items={items} key={index} isStatement />;
      })}
    </div>
  );
};

export default Statement;
