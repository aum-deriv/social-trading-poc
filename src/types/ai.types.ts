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
