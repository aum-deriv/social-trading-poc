import { useMemo, useState, useEffect, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useViewport } from '../../../../hooks';
import AIButton from '../../../../components/AIButton';
import ArrowUpTrend from '../../../../assets/icons/ArrowUpTrend';
import ArrowDownTrend from '../../../../assets/icons/ArrowDownTrend';
import YahooLogo from '../../../../assets/icons/yahoo.png';
import { AIInsight } from '../../../../types/ai.types';
import InsightsList from '../InsightsList/InsightsList';
import CloseIcon from '../../../../assets/icons/CloseIcon';
import './TrendingAssets.css';

interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

interface TrendingAssetsProps {
  assets: Asset[];
  loading: boolean;
}

export default function TrendingAssets({ assets, loading }: TrendingAssetsProps) {
  const LLM_SERVER_URL = import.meta.env.VITE_LLM_SERVER_URL;

  if (!LLM_SERVER_URL) {
    throw new Error('VITE_LLM_SERVER_URL environment variable is not set');
  }
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isMobile, isTablet } = useViewport();
  const insightsListRef = useRef<HTMLDivElement>(null);
  const shouldShowModal = useMemo(() => {
    return (isMobile || isTablet) && insights.length > 0;
  }, [isMobile, isTablet, insights.length]);

  useEffect(() => {
    if (shouldShowModal) {
      setIsModalOpen(true);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      // Scroll to top when modal opens or new insights are added
      setTimeout(() => {
        const insightsContent = insightsListRef.current?.querySelector('.insights-list__content');
        if (insightsContent) {
          insightsContent.scrollTop = 0;
        }
      }, 100); // Small delay to ensure modal is rendered
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [insights, shouldShowModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isModalOpen &&
        insightsListRef.current &&
        !insightsListRef.current.contains(event.target as Node)
      ) {
        handleCloseModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const handleRemoveInsight = (postId: string) => {
    setInsights(prev => prev.filter(insight => insight.postId !== postId));
  };
  const [loadingSymbol, setLoadingSymbol] = useState<{ symbol: string; name: string } | null>(null);

  const handleGetInsight = async (symbol: string, name: string) => {
    try {
      setLoadingSymbol({ symbol, name });
      const response = await fetch(`${LLM_SERVER_URL}/api/ai/ai-insights-for-symbol/${symbol}`);
      const data = await response.json();
      if (data.insight) {
        setInsights(prev => {
          // Remove any existing insight for this symbol
          const filtered = prev.filter(i => i.symbol !== symbol);
          // Add new insight with symbol information
          const insightWithSymbol = {
            ...data.insight,
            symbol,
            symbolName: name,
            postId: `${symbol}_${Date.now()}`, // Keep postId for backwards compatibility
          };
          return [...filtered, insightWithSymbol];
        });
      }
    } catch (error) {
      console.error('Error fetching insight:', error);
    } finally {
      setLoadingSymbol(null);
    }
  };
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage));
  }, [assets]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  const renderInsightsList = () => {
    if (!insights.length && !loadingSymbol) return null;

    return (
      <>
        {shouldShowModal && (
          <div
            className={`modal-backdrop ${isModalOpen ? 'open' : ''}`}
            onClick={handleCloseModal}
          />
        )}
        <div
          ref={insightsListRef}
          className={`trending-assets-insights ${shouldShowModal ? 'modal' : ''} ${isModalOpen ? 'open' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {shouldShowModal && (
            <button className="modal-close-button" onClick={handleCloseModal}>
              <CloseIcon />
            </button>
          )}
          <InsightsList
            insights={insights}
            loadingSymbol={loadingSymbol}
            onRemoveInsight={handleRemoveInsight}
            hideCloseButtons={isMobile || isTablet}
            hideLoader={isMobile || isTablet}
          />
        </div>
      </>
    );
  };

  return (
    <div className="trending-assets-container">
      <h2 className="trending-assets-heading">
        <img src={YahooLogo} alt="Yahoo Finance" className="yahoo-finance-logo" />
        Yahoo Finance Suggested Assets
      </h2>
      <div className="trending-assets-wrapper">
        <div className="trending-assets-section">
          <div className="trending-assets">
            {loading
              ? [...Array(5)].map((_, index) => (
                  <div key={index} className="asset-card">
                    <div className="asset-card__image">
                      <Skeleton circle width={isMobile ? 48 : 100} height={isMobile ? 48 : 100} />
                    </div>
                    <div className="asset-card__content">
                      <div className="asset-card__header">
                        <Skeleton
                          width={120}
                          height={20}
                          style={{ marginBottom: 'var(--spacing-2xs)' }}
                        />
                        <Skeleton width={80} height={16} />
                      </div>
                      <div className="asset-card__stats">
                        <div className="asset-card__left">
                          <Skeleton
                            width={80}
                            height={20}
                            style={{ marginBottom: 'var(--spacing-2xs)' }}
                          />
                          <Skeleton width={60} height={16} />
                        </div>
                        <div className="asset-card__ai-button">
                          <Skeleton width={80} height={36} borderRadius={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : sortedAssets.map(asset => (
                  <div key={asset.symbol} className="asset-card">
                    <img src={asset.imageUrl} alt={asset.name} className="asset-card__image" />
                    <div className="asset-card__content">
                      <div className="asset-card__header">
                        <h3 className="asset-card__title">{asset.name}</h3>
                        <span className="asset-card__symbol">{asset.symbol}</span>
                      </div>
                      <div className="asset-card__stats">
                        <div className="asset-card__left">
                          <span className="asset-card__price">
                            ${asset.currentPrice.toFixed(2)}
                          </span>
                          <span
                            className={`asset-card__change ${asset.direction === 'up' ? 'up' : 'down'}`}
                          >
                            {asset.direction === 'up' ? <ArrowUpTrend /> : <ArrowDownTrend />}
                            {Math.abs(asset.changePercentage).toFixed(2)}%
                          </span>
                        </div>
                        <div className="asset-card__ai-button">
                          <AIButton
                            onClick={() => handleGetInsight(asset.symbol, asset.name)}
                            isLoading={loadingSymbol?.symbol === asset.symbol}
                            loadingText="Analyzing..."
                          >
                            Ask AI
                          </AIButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
          {renderInsightsList()}
        </div>
      </div>
    </div>
  );
}
