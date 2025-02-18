export type TradeType =
  | 'rise_fall'
  | 'touch_no_touch'
  | 'accumulators'
  | 'digits'
  | 'multipliers'
  | 'turbos';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  accountId: string;
  copiers: string[];
  winRate: number;
  totalPnL: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tradeType: TradeType;
  riskLevel: 'low' | 'medium' | 'high';
  minInvestment: number;
  maxInvestment: number;
  tradingPairs: string[];
  timeframe: string;
  performance: {
    totalReturn: number;
    winRate: number;
    averageProfit: number;
  };
}

export interface ExtendedStrategy extends Strategy {
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  currency?: string;
  isFollowing?: boolean;
  isCopying?: boolean;
}

export default Strategy;
