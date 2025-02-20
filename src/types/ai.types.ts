import { PostSentiment } from '@/modules/feed/components/FeedList/components/FeedItem/components/PostAIInsights/config';

export interface NewsItem {
  title: string;
  url: string;
}

export interface AIInsight {
  postId: string;
  symbol?: string;
  symbolName?: string;
  summary: string;
  sentiment: PostSentiment;
  isLegitimate: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  news?: NewsItem[];
  yahooFinanceUrl?: string;
}

export interface GlobalAIResponse {
  type: 'data_query' | 'product_info' | 'invalid';
  answer: string;
  data?: {
    items: Array<{
      type: 'leader' | 'strategy' | 'copier' | 'market';
      aiScore: number;
      analysis: {
        strengths: string[];
        risks: string[];
        recommendation?: string;
      };
      data: object;
      id: string;
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

export interface ChatMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'ai';
  data?: GlobalAIResponse['data'];
  navigation?: GlobalAIResponse['navigation'];
}
