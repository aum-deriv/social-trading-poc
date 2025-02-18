export interface SuggestedLeader {
  copiers: number;
  leaderId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  totalProfit: number;
  compatibilityScore: number;
  matchDetails: {
    riskScore: number;
    styleScore: number;
    marketScore: number;
    frequencyScore: number;
  };
  performance: {
    winRate: number;
    totalPnL: number;
    monthlyReturn: number;
    totalTrades: number;
  };
  strategies: Array<{
    id: string;
    name: string;
    description: string;
    riskLevel: string;
    performance: {
      totalReturn: number;
      winRate: number;
      averageProfit: number;
    };
  }>;
}
