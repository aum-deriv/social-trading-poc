import { User, TradingStrategy } from '../../types';
import { QueryParameters } from '../../types/globalAI.types';
import { MarketService } from '../../services/market';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
  throw new Error('JSON_SERVER_URL environment variable is not set');
}

export async function getLeadersByPerformance(params: QueryParameters): Promise<User[]> {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/users?userType=leader`);
    if (!response.ok) throw new Error('Failed to fetch leaders');
    let data = (await response.json()) as User[];

    // Sort by performance
    data = data.sort((a, b) => {
      const aPerf = a.performance?.totalPnL || 0;
      const bPerf = b.performance?.totalPnL || 0;
      return params.sortOrder === 'desc' ? bPerf - aPerf : aPerf - bPerf;
    });

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit);
    }

    return data;
  } catch (error) {
    console.error('Error fetching leaders by performance:', error);
    return [];
  }
}

export async function getLeadersByCopiers(params: QueryParameters): Promise<User[]> {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/users?userType=leader`);
    if (!response.ok) throw new Error('Failed to fetch leaders');
    let data = (await response.json()) as User[];

    // Sort by number of copiers (followers)
    data = data.sort((a, b) => {
      const aCopiers = a.followers?.length || 0;
      const bCopiers = b.followers?.length || 0;
      return params.sortOrder === 'desc' ? bCopiers - aCopiers : aCopiers - bCopiers;
    });

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit);
    }

    return data;
  } catch (error) {
    console.error('Error fetching leaders by copiers:', error);
    return [];
  }
}

export async function getStrategiesByReturn(params: QueryParameters): Promise<TradingStrategy[]> {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/tradingStrategies`);
    if (!response.ok) throw new Error('Failed to fetch strategies');
    let data = (await response.json()) as TradingStrategy[];

    // Filter by minimum return if specified
    if (params.filters?.minReturn !== undefined) {
      data = data.filter(
        s => (s.performance?.totalReturn || 0) >= (params.filters?.minReturn || 0)
      );
    }

    // Sort by return
    data = data.sort((a, b) => {
      const aReturn = a.performance?.totalReturn || 0;
      const bReturn = b.performance?.totalReturn || 0;
      return params.sortOrder === 'desc' ? bReturn - aReturn : aReturn - bReturn;
    });

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit);
    }

    return data;
  } catch (error) {
    console.error('Error fetching strategies by return:', error);
    return [];
  }
}

export async function getStrategiesByRisk(params: QueryParameters): Promise<TradingStrategy[]> {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/tradingStrategies`);
    if (!response.ok) throw new Error('Failed to fetch strategies');
    let data = (await response.json()) as TradingStrategy[];

    // Filter by maximum risk if specified
    if (params.filters?.maxRisk) {
      const riskLevels = { low: 1, medium: 2, high: 3 };
      const maxRiskLevel = riskLevels[params.filters.maxRisk as 'low' | 'medium' | 'high'];
      data = data.filter(s => riskLevels[s.riskLevel] <= maxRiskLevel);
    }

    // Sort by risk level
    data = data.sort((a, b) => {
      const riskLevels = { low: 1, medium: 2, high: 3 };
      const aRisk = riskLevels[a.riskLevel];
      const bRisk = riskLevels[b.riskLevel];
      return params.sortOrder === 'desc' ? bRisk - aRisk : aRisk - bRisk;
    });

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit);
    }

    return data;
  } catch (error) {
    console.error('Error fetching strategies by risk:', error);
    return [];
  }
}

export async function getCopiersByProfit(params: QueryParameters): Promise<User[]> {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/users?userType=copier`);
    if (!response.ok) throw new Error('Failed to fetch copiers');
    let data = (await response.json()) as User[];

    // Sort by total profit (PnL)
    data = data.sort((a, b) => {
      const aProfit = a.performance?.totalPnL || 0;
      const bProfit = b.performance?.totalPnL || 0;
      return params.sortOrder === 'desc' ? bProfit - aProfit : aProfit - bProfit;
    });

    // Apply limit
    if (params.limit) {
      data = data.slice(0, params.limit);
    }

    return data;
  } catch (error) {
    console.error('Error fetching copiers by profit:', error);
    return [];
  }
}

export async function getMarketsByVolume(params: QueryParameters): Promise<TrendingAsset[]> {
  try {
    const marketService = new MarketService();
    const assets = await marketService.getTrendingAssets();

    // Sort by trading volume (in this case we'll use price change percentage as a proxy)
    const sortedAssets = assets.sort((a, b) => {
      const aVolume = Math.abs(a.changePercentage);
      const bVolume = Math.abs(b.changePercentage);
      return params.sortOrder === 'desc' ? bVolume - aVolume : aVolume - bVolume;
    });

    // Apply limit
    if (params.limit) {
      return sortedAssets.slice(0, params.limit);
    }

    return sortedAssets;
  } catch (error) {
    console.error('Error fetching markets by volume:', error);
    return [];
  }
}

// Map function names to their implementations
export const queryFunctions = {
  getLeadersByPerformance,
  getLeadersByCopiers,
  getStrategiesByReturn,
  getStrategiesByRisk,
  getCopiersByProfit,
  getMarketsByVolume,
} as const;

// Type for the query functions map
export type QueryFunctionMap = typeof queryFunctions;

// Re-export TrendingAsset type for use in GlobalAIResponse
export interface TrendingAsset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}
