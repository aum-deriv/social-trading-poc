export interface Strategy {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    copiers: string[];
    winRate: number;
    totalPnL: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    minInvestment: number;
    maxInvestment: number;
    tradingPairs: string[];
    timeframe: string;
    performance: {
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
    };
}

export default Strategy;
