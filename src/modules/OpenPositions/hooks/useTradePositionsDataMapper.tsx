import { useState } from 'react';
import { TradeType } from '../types';
import { MultiplierContract, BaseContract } from '@/types/contract.types';

type Contract = MultiplierContract & BaseContract;

const useTradePositionsDataMapper = (contracts: Contract[]) => {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(contracts);

  const removeContract = (contractId: string) => {
    setFilteredContracts(prevContracts =>
      prevContracts.filter(contract => contract.contractId !== contractId)
    );
  };

  const multiplierContracts = filteredContracts.filter(
    contract => contract.contractType === TradeType.Multipliers
  ) as MultiplierContract[];

  const optionContracts = filteredContracts.filter(
    contract => contract.contractType === TradeType.Options
  ) as BaseContract[];

  const accumulatorContracts = filteredContracts.filter(
    contract => contract.contractType === TradeType.Accumulators
  ) as BaseContract[];

  return {
    multiplierContracts,
    optionContracts,
    accumulatorContracts,
    removeContract,
  };
};

export default useTradePositionsDataMapper;
