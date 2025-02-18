import { useState } from 'react';
import Dropdown from '@components/Dropdown/Dropdown';
import { TradePositions } from './components/TradePositions';
import dbData from '../../../json-server/data/db.json';
import { TradeType } from './types';
import './OpenPositions.css';

const OpenPositions = () => {
  const [selectedTradeType, setSelectedTradeType] = useState<TradeType>(TradeType.Options);

  const handleTradeTypeChange = (selected: string) => {
    setSelectedTradeType(selected as TradeType);
  };

  return (
    <div className="open-positions">
      <div className="open-positions-header">
        <Dropdown
          options={Object.values(TradeType)}
          selected={selectedTradeType}
          onSelect={handleTradeTypeChange}
        />
      </div>
      <TradePositions contracts={dbData.contracts || []} tradeType={selectedTradeType} />
    </div>
  );
};

export default OpenPositions;
