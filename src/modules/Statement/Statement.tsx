import { useState } from 'react';
import dbData from '../../../json-server/data/db.json';
import { StatementCard } from './components/StatementCard';
import Dropdown from '@/components/Dropdown/Dropdown';
import { TradeType } from '../OpenPositions/types';
import './Statement.css';

enum SortOrder {
  NewestFirst = 'Newest First',
  OldestFirst = 'Oldest First',
}

interface StatementItem {
  type: string;
  referenceId: number;
  currency: string;
  transactionTime: string;
  actionType: string;
  amount: number;
  balanceAfter: number;
}

const Statement = () => {
  const [selectedTradeType, setSelectedTradeType] = useState<TradeType>(TradeType.Multipliers);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NewestFirst);
  const statements = (dbData.statements || []) as StatementItem[];

  const handleTradeTypeChange = (selected: string) => {
    setSelectedTradeType(selected as TradeType);
  };

  const handleSortOrderChange = (selected: string) => {
    setSortOrder(selected as SortOrder);
  };

  const filteredStatements = statements.filter(item => item.type === selectedTradeType);

  const sortedStatements = [...filteredStatements].sort((a, b) => {
    const dateA = new Date(a.transactionTime);
    const dateB = new Date(b.transactionTime);
    return sortOrder === SortOrder.NewestFirst
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  return (
    <div>
      <div className="statement-header">
        <div className="statement-filters">
          <div className="statement-filters__item">
            <Dropdown
              options={Object.values(TradeType)}
              selected={selectedTradeType}
              onSelect={handleTradeTypeChange}
            />
          </div>
          <div className="statement-filters__item">
            <Dropdown
              options={Object.values(SortOrder)}
              selected={sortOrder}
              onSelect={handleSortOrderChange}
            />
          </div>
        </div>
      </div>
      <div className="statement-card-container">
        {sortedStatements.map(item => (
          <StatementCard key={item.referenceId} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Statement;
