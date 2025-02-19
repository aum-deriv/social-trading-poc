import type { User, TradingStrategy } from './index';

export type QueryType = 'data_query' | 'product_info';

export type QueryFunction =
  | 'getLeadersByPerformance'
  | 'getLeadersByCopiers'
  | 'getStrategiesByReturn'
  | 'getStrategiesByRisk'
  | 'getCopiersByProfit'
  | 'getMarketsByVolume';

export interface QueryParameters {
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  filters?: {
    minReturn?: number;
    maxRisk?: number;
    markets?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  };
}

export interface GlobalAIResponse {
  answer: string;
  type: QueryType;
  data?: {
    items: Array<{
      id: string;
      type: 'leader' | 'strategy' | 'copier' | 'market';
      aiScore: number;
      analysis: {
        strengths: string[];
        risks: string[];
        recommendation?: string;
      };
      data: User | TradingStrategy;
    }>;
    summary: {
      total: number;
      averageScore: number;
      timeframe?: string;
      analysis: {
        trends: string[];
        insights: string[];
      };
    };
  };
  navigation?: {
    steps: string[];
    relevantScreens: string[];
    features: string[];
  };
}

export interface FunctionCallResult {
  function: QueryFunction;
  parameters: QueryParameters;
}
