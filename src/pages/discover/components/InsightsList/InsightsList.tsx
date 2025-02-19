import { AIInsight } from '../../../../types/ai.types';
import Badge from '../../../../components/feedback/Badge';
import Button from '../../../../components/input/Button';
import AILoader from '../../../../components/AILoader';
import { getSentimentDetails } from '../../../../modules/feed/components/FeedList/components/FeedItem/components/PostAIInsights/config';
import './InsightsList.css';

interface InsightsListProps {
  insights: AIInsight[];
  loadingSymbol: { symbol: string; name: string } | null;
  onRemoveInsight?: (postId: string) => void;
  hideCloseButtons?: boolean;
  hideLoader?: boolean;
}

export default function InsightsList({
  insights,
  loadingSymbol,
  onRemoveInsight,
  hideCloseButtons,
  hideLoader,
}: InsightsListProps) {
  if (insights.length === 0) {
    return null;
  }
  return (
    <div className="insights-list">
      <h3 className="insights-list__title">AI Insights</h3>
      <div className="insights-list__content">
        {loadingSymbol && !hideLoader && (
          <AILoader
            symbol={`${loadingSymbol.name} (${loadingSymbol.symbol})`}
            size={60}
            variant="card"
          />
        )}
        {[...insights].reverse().map(insight => (
          <div key={insight.postId} className="post-ai-insights">
            <div className="post-ai-insights__header">
              <h4 className="post-ai-insights__title">
                ✦ AI Insights for{' '}
                {insight.symbolName || insight.symbol || insight.postId.split('_')[0]}
              </h4>
              {!hideCloseButtons && (
                <button
                  className="post-ai-insights__close"
                  onClick={() => onRemoveInsight?.(insight.postId)}
                  aria-label="Close insight"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Quick Actions */}
            <div className="post-ai-insights__actions">
              <div className="post-ai-insights__actions-grid">
                <Button variant="primary" rounded>
                  Trade Now
                </Button>
              </div>
            </div>
            <p className="post-ai-insights__summary">{insight.summary}</p>
            <div className="post-ai-insights__badges">
              <Badge
                variant={insight.isLegitimate ? 'success' : 'warning'}
                icon={insight.isLegitimate ? '✓' : '⚠️'}
              >
                {insight.isLegitimate ? 'Verified' : 'Needs Verification'}
              </Badge>
              <Badge
                variant={getSentimentDetails(insight.sentiment).variant}
                icon={getSentimentDetails(insight.sentiment).icon}
              >
                {getSentimentDetails(insight.sentiment).text}
              </Badge>
              <Badge
                variant={
                  insight.riskLevel === 'low'
                    ? 'success'
                    : insight.riskLevel === 'medium'
                      ? 'warning'
                      : 'failed'
                }
                icon={
                  insight.riskLevel === 'low' ? '🛡️' : insight.riskLevel === 'medium' ? '⚠️' : '⚡'
                }
              >
                {`${insight.riskLevel.charAt(0).toUpperCase()}${insight.riskLevel.slice(1)} Risk`}
              </Badge>
            </div>
            <p className="post-ai-insights__recommendation">{insight.recommendation}</p>
            {/* News and Resources */}
            <div className="post-ai-insights__resources">
              <h4 className="post-ai-insights__resources-title">News & Resources</h4>
              <div className="post-ai-insights__links">
                {insight.news?.map((newsItem, index) => (
                  <a
                    key={index}
                    href={newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-ai-insights__link"
                  >
                    📰 {newsItem.title}
                  </a>
                ))}
                {insight.yahooFinanceUrl && (
                  <a
                    href={insight.yahooFinanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-ai-insights__link"
                  >
                    📊 View on Yahoo Finance
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
