import { useState } from "react";
import Dropdown from "@components/Dropdown/Dropdown";
import { TradePositions } from "./components/TradePositions";
import { tradeTypes } from "./constants";

const OpenPositions = () => {
  const [selectedTradeType, setSelectedTradeType] = useState<
    keyof typeof tradeTypes
  >(tradeTypes.Options);

  const handleTradeTypeChange = (selected: string) => {
    setSelectedTradeType(selected as keyof typeof tradeTypes);
  };

  return (
    <div>
      <Dropdown
        options={Object.values(tradeTypes)}
        selected={selectedTradeType}
        onChange={handleTradeTypeChange}
      />
      <TradePositions
        contracts={[]}
        tradeType={selectedTradeType}
      />
    </div>
  );
};

export default OpenPositions;
