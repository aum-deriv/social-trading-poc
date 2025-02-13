import Button from "@/components/input/Button";
import Badge from "@/components/feedback/Badge";
import { getSentimentDetails } from "./config";
import type { AIInsight } from "@/types/ai.types";
import "./PostAIInsights.css";

interface PostAIInsightsProps {
    insight: AIInsight;
    userType: "leader" | "copier";
    onCopyTrader?: () => void;
}

const PostAIInsights = ({
    insight,
    userType,
    onCopyTrader,
}: PostAIInsightsProps) => {
    // Return null if insight is not valid
    if (!insight || !insight.sentiment) {
        return null;
    }

    const sentimentDetails = getSentimentDetails(insight.sentiment);

    return (
        <div className="post-ai-insights">
            {/* Header */}
            <h4 className="post-ai-insights__title">✦ AI Insights</h4>

            {/* Summary */}
            <p className="post-ai-insights__summary">{insight.summary}</p>

            {/* Badges Row */}
            <div className="post-ai-insights__badges">
                <Badge
                    variant={insight.isLegitimate ? "success" : "warning"}
                    icon={insight.isLegitimate ? "✓" : "⚠️"}
                >
                    {insight.isLegitimate ? "Verified" : "Needs Verification"}
                </Badge>
                <Badge
                    variant={sentimentDetails.variant}
                    icon={sentimentDetails.icon}
                >
                    {sentimentDetails.text}
                </Badge>
                <Badge
                    variant={
                        insight.riskLevel === "low"
                            ? "success"
                            : insight.riskLevel === "medium"
                            ? "warning"
                            : "failed"
                    }
                    icon={
                        insight.riskLevel === "low"
                            ? "🛡️"
                            : insight.riskLevel === "medium"
                            ? "⚠️"
                            : "⚡"
                    }
                >
                    {`${insight.riskLevel
                        .charAt(0)
                        .toUpperCase()}${insight.riskLevel.slice(1)} Risk`}
                </Badge>
            </div>

            {/* Recommendation */}
            <p className="post-ai-insights__recommendation">
                {insight.recommendation}
            </p>

            {/* Quick Actions */}
            <div className="post-ai-insights__actions">
                <h4 className="post-ai-insights__actions-title">
                    Quick Actions
                </h4>
                <div className="post-ai-insights__actions-grid">
                    {userType === "copier" ? (
                        <Button
                            variant="primary"
                            onClick={onCopyTrader}
                            rounded
                        >
                            Copy Trader
                        </Button>
                    ) : (
                        <Button variant="primary" rounded>
                            Trade Now
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostAIInsights;
