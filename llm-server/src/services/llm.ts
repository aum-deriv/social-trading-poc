import Anthropic from "@anthropic-ai/sdk";
import { Post, Comment, AIInsight, User, TradingStrategy } from "../types";
import { PostSentiment } from "../types/sentiment";

export class LLMService {
    private anthropic: Anthropic;
    private readonly MODEL = "claude-3-5-sonnet-20241022";

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("ANTHROPIC_API_KEY is required");
        }
        this.anthropic = new Anthropic({ apiKey });
    }

    private async analyzePostContent(
        post: Post,
        user: User,
        strategies: TradingStrategy[]
    ) {
        const prompt = `
            Analyze this trading-related post and provide insights based on the user's profile:

            Post Content: ${JSON.stringify(post.content)}
            Post Comments: ${JSON.stringify(post.engagement.comments)}
            User Type: ${user.userType}
            Related Strategies: ${JSON.stringify(strategies)}

            Provide analysis in JSON format with:
            {
                "summary": "Brief overview of the post content",
                "sentiment": "One of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update",
                "isLegitimate": "Boolean indicating if the content appears legitimate",
                "riskLevel": "Assessment of trading risk (low/medium/high)",
                "recommendation": "Personalized recommendation based on user type and risk level"
            }
        `;

        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const content = response.content[0].text || "{}";
        return JSON.parse(content) as {
            summary: string;
            sentiment: PostSentiment;
            isLegitimate: boolean;
            riskLevel: string;
            recommendation: string;
        };
    }

    private async analyzePostComments(comments: Comment[]) {
        if (comments.length === 0) return "neutral";

        const prompt = `
            Analyze these trading-related post comments for sentiment:
            ${JSON.stringify(comments)}

            Provide sentiment analysis in JSON format with:
            {
                "overallSentiment": "positive/neutral/negative",
                "confidence": "0-1 score",
                "keyThemes": ["array of main themes"],
                "riskIndicators": ["array of concerning patterns or none"]
            }
        `;

        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const content = response.content[0].text || "{}";
        return JSON.parse(content);
    }

    public async generatePostInsights(
        posts: Post[],
        user: User,
        strategies: TradingStrategy[]
    ): Promise<AIInsight[]> {
        const insights: AIInsight[] = [];

        for (const post of posts) {
            try {
                const analysis = await this.analyzePostContent(
                    post,
                    user,
                    strategies
                );
                const sentiment = await this.analyzePostComments(
                    post.engagement.comments
                );

                insights.push({
                    postId: post.id,
                    ...analysis,
                    sentiment: this.determinePostSentiment(
                        analysis.sentiment,
                        sentiment
                    ),
                });
            } catch (error) {
                console.error(`Error analyzing post ${post.id}:`, error);
                // Continue with other posts even if one fails
            }
        }

        return insights;
    }

    private determinePostSentiment(
        contentSentiment: PostSentiment,
        commentSentiment: any
    ): PostSentiment {
        // If content is suspicious, prioritize that
        if (
            ["pump_and_dump", "spam", "misleading", "high_risk"].includes(
                contentSentiment
            )
        ) {
            return contentSentiment;
        }

        // If comments show strong negative sentiment, adjust accordingly
        if (
            commentSentiment.overallSentiment === "negative" &&
            commentSentiment.confidence > 0.8 &&
            commentSentiment.riskIndicators.length > 0
        ) {
            return "misleading";
        }

        return contentSentiment;
    }
}
