import { useEffect, useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import RandomValue from "@/components/RandomValue";
import { tradeTypes, TradeType } from "../constants";
import { Contract } from "@/types/contract.types";

const useTradePositionsDataMapper = (
  contracts: Contract[],
  tradeType: TradeType
) => {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(
    contracts.filter((contract) => contract.contract_type === tradeType)
  );

  const removeContract = (contractId: string) => {
    setFilteredContracts((prevContracts) =>
      prevContracts.filter((contract) => contract.contract_id !== contractId)
    );
  };

  useEffect(() => {
    setFilteredContracts(
      contracts.filter((contract) => contract.contract_type === tradeType)
    );
  }, [contracts, tradeType]);

  switch (tradeType) {
    case tradeTypes.Options: {
      return filteredContracts.map((contract) => {
        return [
          contract.contract_type, // "Type"
          contract.contract_id, // "Ref. ID"
          contract.currency, // "Currency"
          contract.buy_price, // "Stake"
          "-", // "Potential payout"
          <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          <CountdownTimer key={contract.contract_id} />, // "Remaining time"
          <>
            <button onClick={() => removeContract(contract.contract_id)}>
              Sell
            </button>
          </>,
        ];
      });
    }
    case tradeTypes.Multipliers: {
      return filteredContracts.map((contract) => {
        return [
          contract.contract_type, // "Type"
          "x10", // "Multiplier"
          contract.currency, // "Currency"
          contract.buy_price, // "Contract cost"
          "-", // "Deal cancel. fee"
          contract.buy_price, // "Stake"
          "-", // "Take profit/Stop loss"
          <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          <>
            <button onClick={() => removeContract(contract.contract_id)}>
              Close
            </button>
          </>, // "Action"
        ];
      });
    }
    case tradeTypes.Accumulators: {
      return filteredContracts.map((contract) => {
        return [
          contract.contract_type, // "Type"
          "1%", // "Growth rate"
          contract.currency, // "Currency"
          contract.buy_price, // "Stake"
          "-", // "Take profit"
          <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          <>
            <button onClick={() => removeContract(contract.contract_id)}>
              Sell
            </button>
          </>, // "Action"
        ];
      });
    }
  }
};

export default useTradePositionsDataMapper;
