import { TradeType } from '@/modules/OpenPositions/types';
import { getStoredAuth } from './authService';

const BASE_URL = import.meta.env.VITE_JSON_SERVER_URL;

export interface Contract {
  id: string;
  contractType: TradeType;
  symbol: string;
  currency: string;
  stake: number;
  leaderId: string;
  leaderDisplayName: string;
  strategyId: string;
  strategyDisplayName: string;
  multiplier?: number;
  contractCost?: number;
  buyPrice?: number;
  dateStart?: string;
  expiryTime?: string;
  payout?: number;
  purchaseTime?: string;
  userId: string;
}

export interface ContractResponse {
  contractId: string;
  contractType: TradeType;
  symbol: string;
  currency: string;
  stake: number;
  leaderId: string;
  leader: string;
  strategyId: string;
  strategyName: string;
  multiplier?: number;
  contractCost?: number;
  buyPrice?: number;
  dateStart?: string;
  expiryTime?: string;
  payout?: number;
  purchaseTime?: string;
}

const transformContract = (contract: Contract): ContractResponse => ({
  contractId: contract.id,
  contractType: contract.contractType,
  symbol: contract.symbol,
  currency: contract.currency,
  stake: contract.stake,
  leaderId: contract.leaderId,
  leader: contract.leaderDisplayName,
  strategyId: contract.strategyId,
  strategyName: contract.strategyDisplayName,
  multiplier: contract.multiplier,
  contractCost: contract.contractCost,
  buyPrice: contract.buyPrice,
  dateStart: contract.dateStart,
  expiryTime: contract.expiryTime,
  payout: contract.payout,
  purchaseTime: contract.purchaseTime,
});

export const contractService = {
  async getContracts(contractType?: TradeType, signal?: AbortSignal): Promise<ContractResponse[]> {
    const auth = getStoredAuth();
    if (!auth) {
      throw new Error('User not authenticated');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('userId', auth.user.id);
    if (contractType) {
      queryParams.append('contractType', contractType);
    }

    const response = await fetch(`${BASE_URL}/contracts?${queryParams.toString()}`, { signal });
    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }

    const contracts: Contract[] = await response.json();
    return contracts.map(transformContract);
  },
};
