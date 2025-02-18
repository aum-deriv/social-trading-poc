import { useEffect, useState } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import RandomValue from '@/components/RandomValue';
import { TradeType } from '../types';
import { Contract } from '@/types/contract.types';

const useTradePositionsDataMapper = (contracts: Contract[], tradeType: TradeType) => {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(
    contracts.filter(contract => contract.contract_type === tradeType)
  );

  const removeContract = (contractId: string) => {
    setFilteredContracts(prevContracts =>
      prevContracts.filter(contract => contract.contract_id !== contractId)
    );
  };

  useEffect(() => {
    setFilteredContracts(contracts.filter(contract => contract.contract_type === tradeType));
  }, [contracts, tradeType]);

  switch (tradeType) {
    case TradeType.Options: {
      return filteredContracts.map(contract => {
        return {
          Type: contract.contract_type, // "Type"
          'Ref. ID': contract.contract_id, // "Ref. ID"
          Currency: contract.currency, // "Currency"
          Stake: contract.buy_price, // "Stake"
          'Potential payout': '-', // "Potential payout"
          'Total profit/loss': <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          'Contract value': <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          'Remaining time': <CountdownTimer key={contract.contract_id} />, // "Remaining time"
          Action: (
            <>
              <button
                className="contract-card-button"
                onClick={() => removeContract(contract.contract_id)}
              >
                Sell
              </button>
            </>
          ), // "Action"
        };
      });
    }
    case TradeType.Multipliers: {
      return filteredContracts.map(contract => {
        return {
          Type: contract.contract_type, // "Type"
          Multiplier: 'x10', // "Multiplier"
          'Ref. ID': contract.contract_id, // "Ref. ID"
          Currency: contract.currency, // "Currency"
          'Contract cost': contract.buy_price, // "Contract cost"
          'Deal cancel. fee': '-', // "Deal cancel. fee"
          Stake: contract.buy_price, // "Stake"
          'Take profit/Stop loss': '-', // "Take profit/Stop loss"
          'Contract value': <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          'Total profit/loss': <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          Action: (
            <>
              <button
                className="contract-card-button"
                onClick={() => removeContract(contract.contract_id)}
              >
                Close
              </button>
            </>
          ), // "Action"
        };
      });
    }
    case TradeType.Accumulators: {
      return filteredContracts.map(contract => {
        return {
          Type: contract.contract_type, // "Type"
          'Ref. ID': contract.contract_id, // "Ref. ID"
          'Growth rate': '1%', // "Growth rate"
          Currency: contract.currency, // "Currency"
          Stake: contract.buy_price, // "Stake"
          'Take profit': '-', // "Take profit"
          'Contract value': <RandomValue key={`cv-${contract.contract_id}`} />, // "Contract value"
          'Total profit/loss': <RandomValue key={`tpl-${contract.contract_id}`} />, // "Total profit/loss"
          Action: (
            <>
              <button
                className="contract-card-button"
                onClick={() => removeContract(contract.contract_id)}
              >
                Sell
              </button>
            </>
          ), // "Action"
        };
      });
    }
  }
};

export default useTradePositionsDataMapper;
