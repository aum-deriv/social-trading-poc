import { GlobalAIResponse } from '@/types/ai.types';
import UserCard from '@/pages/discover/components/UserCard/UserCard';
import StrategyCard from '@/pages/discover/components/StrategyCard/StrategyCard';
import AssetCard from '@/components/AssetCard';
import Chip from '@/components/Chip';
import './DataAttachments.css';

interface DataAttachmentsProps {
  data: NonNullable<GlobalAIResponse['data']>;
}

interface UserData {
  id: string;
  username?: string;
  profilePicture?: string;
  copiers: number;
  totalProfit: number;
  isFollowing: boolean;
  winRate: number;
}

interface StrategyData {
  id: string;
  leaderId: string;
  accountId: string;
  name: string;
  description: string;
  tradeType: string;
  copiers: string[];
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  currency?: string;
  isFollowing?: boolean;
  isCopying?: boolean;
}

interface MarketData {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

const DataAttachments = ({ data }: DataAttachmentsProps) => {
  const handleCopyStrategy = (id: string) => {
    // Handle copy strategy
    console.log('Copy strategy:', id);
  };

  return (
    <div className="data-attachments">
      {data.items.map(item => {
        switch (item.type) {
          case 'leader':
          case 'copier':
            return (
              <div key={item.id} className="data-attachments__card">
                <UserCard user={item.data as UserData} />
              </div>
            );
          case 'strategy':
            return (
              <div key={item.id} className="data-attachments__card">
                <StrategyCard strategy={item.data as StrategyData} onCopy={handleCopyStrategy} />
              </div>
            );
          case 'market':
            return (
              <div key={item.id} className="data-attachments__card">
                <AssetCard data={item.data as MarketData} />
              </div>
            );
        }
      })}
      <div className="data-attachments__summary">
        <Chip>Trends: {data.summary.analysis.trends.join(', ')}</Chip>
        <Chip>Insights: {data.summary.analysis.insights.join(', ')}</Chip>
      </div>
    </div>
  );
};

export default DataAttachments;
