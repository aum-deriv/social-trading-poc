import { PostSentiment } from "@/modules/feed/components/FeedList/components/FeedItem/components/PostAIInsights/config";

export interface AIInsight {
    postId: string;
    summary: string;
    sentiment: PostSentiment;
    isLegitimate: boolean;
    riskLevel: "low" | "medium" | "high";
    recommendation: string;
}
