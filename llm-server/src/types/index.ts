import { PostSentiment } from "./sentiment";

export interface User {
    id: string;
    userType: "leader" | "copier";
    followers: string[];
    following: string[];
    accounts: string[];
}

export interface Post {
    id: string;
    userId: string;
    content: {
        text: string;
        images?: string[];
    };
    engagement: {
        likes: string[];
        comments: Comment[];
        shares: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    userId: string;
    content: string;
    likes: string[];
    createdAt: string;
    updatedAt: string;
    replies?: Comment[];
}

export interface TradingStrategy {
    id: string;
    leaderId: string;
    accountId: string;
    name: string;
    description: string;
    tradeType: string;
    riskLevel: "low" | "medium" | "high";
    performance: {
        totalReturn: number;
        winRate: number;
        averageProfit: number;
    };
    copiers: string[];
}

export interface AIInsight {
    postId: string;
    summary: string;
    sentiment: PostSentiment;
    isLegitimate: boolean;
    riskLevel: string;
    recommendation: string;
}

export interface AIAnalysisResponse {
    insights: AIInsight[];
}
