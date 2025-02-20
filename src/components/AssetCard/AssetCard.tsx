import ArrowUpTrend from '@/assets/icons/ArrowUpTrend';
import ArrowDownTrend from '@/assets/icons/ArrowDownTrend';
import './AssetCard.css';

interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

interface AssetCardProps {
  data: Asset;
}

const AssetCard = ({ data }: AssetCardProps) => {
  return (
    <div className="asset-card">
      <img src={data.imageUrl} alt={data.name} className="asset-card__image" />
      <div className="asset-card__content">
        <div className="asset-card__header">
          <h3 className="asset-card__title">{data.name}</h3>
          <span className="asset-card__symbol">{data.symbol}</span>
        </div>
        <div className="asset-card__stats">
          <div className="asset-card__left">
            <span className="asset-card__price">${data.currentPrice.toFixed(2)}</span>
            <span className={`asset-card__change ${data.direction}`}>
              {data.direction === 'up' ? <ArrowUpTrend /> : <ArrowDownTrend />}
              {Math.abs(data.changePercentage).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
