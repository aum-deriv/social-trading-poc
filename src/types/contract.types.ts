import { TradeType } from '@/modules/OpenPositions/types';

export interface BaseContract {
  symbol: string;
  contractId: string;
  contractType: TradeType;
  currency: string;
  strategyName: string;
  leader: string;
  leaderId: string;
  strategyId: string;
  stake: number;
  multiplier?: number;
  contractCost?: number;
  buyPrice?: number;
  dateStart?: string;
  expiryTime?: string;
  payout?: number;
  purchaseTime?: string;
}

export interface MultiplierContract extends BaseContract {
  multiplier: number;
  contractCost: number;
}

export interface AccumulatorContract extends BaseContract {
  buyPrice: number;
  dateStart: string;
  expiryTime: string;
  payout: number;
  purchaseTime: string;
}
