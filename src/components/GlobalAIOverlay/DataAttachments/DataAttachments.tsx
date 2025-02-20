import { GlobalAIResponse } from '@/types/ai.types';
import UserCard from '@/pages/discover/components/UserCard/UserCard';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import AssetCard from '@/components/AssetCard';
import './DataAttachments.css';
import { ExtendedStrategy } from '@/types/strategy.types';

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

interface MarketData {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

const DataAttachments = ({ data }: DataAttachmentsProps) => {
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
                <StrategyListItem
                  strategy={item.data as ExtendedStrategy}
                  onClick={() => {
                    window.location.href = `/strategies/${item.id}`;
                  }}
                />
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
    </div>
  );
};

export default DataAttachments;
