// Types for request parameters
export interface LeaderSuggestionsParams {
  copierId: string; // URL parameter
}

export interface MatchingParameters {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentStyle: 'conservative' | 'moderate' | 'aggressive';
  tradingFrequency: 'daily' | 'weekly' | 'monthly';
  preferredMarkets: string[];
  maxDrawdown: number;
  targetReturn: number;
}

export interface LeaderSuggestion {
  leaderId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  copiers: number;
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
  strategies: {
    id: string;
    name: string;
    description: string;
    riskLevel: string;
    performance: {
      totalReturn: number;
      winRate: number;
      averageProfit: number;
    };
  }[];
}

export interface LeaderSuggestionsResponse {
  suggestions: LeaderSuggestion[];
  totalResults: number;
}
