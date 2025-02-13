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

    private sanitizeText(text: string) {
        console.log(`[LLM] Sanitizing text (${text.length} chars)`);
        const result = text.replace(/[^\x20-\x7E]/g, "").trim();
        console.log(`[LLM] Sanitized result (${result.length} chars)`);
        return result;
    }

    private sanitizeJsonText(text: string) {
        console.log(`[LLM] Sanitizing JSON text (${text.length} chars)`);
        const result = text.replace(/[^\x20-\x7E]/g, "");
        console.log(`[LLM] Sanitized JSON result (${result.length} chars)`);
        return result;
    }

    private trimPostContent(post: Post) {
        console.log(`[LLM] Trimming content for post ${post.id}`);
        const result = {
            text: this.sanitizeText(post.content.text.slice(0, 500)),
            userId: post.userId,
            id: post.id,
        };
        console.log(`[LLM] Trimmed post content length: ${result.text.length}`);
        return result;
    }

    private trimComments(comments: Comment[]) {
        console.log(`[LLM] Trimming ${comments.length} comments`);
        const result = comments.slice(0, 3).map((c) => ({
            content: this.sanitizeText(c.content.slice(0, 200)),
            userId: c.userId,
            likes: c.likes.length,
        }));
        console.log(`[LLM] Trimmed to ${result.length} comments`);
        return result;
    }

    private async analyzeAllPosts(
        posts: Post[],
        user: User,
        strategies: TradingStrategy[]
    ): Promise<AIInsight[]> {
        console.log(`[LLM] Preparing batch analysis for ${posts.length} posts`);

        // Prepare all posts data
        const postsData = posts.map((post) => ({
            id: post.id,
            content: this.trimPostContent(post),
            comments: this.trimComments(post.engagement.comments),
        }));

        const prompt = `
            Analyze these trading-related posts and provide insights based on the user's profile:

            Posts: ${JSON.stringify(postsData)}
            User Type: ${user.userType}
            Related Strategies: ${JSON.stringify(strategies)}

            Provide an array of analyses in JSON format, where each analysis follows this structure:
            {
                "postId": "post's id",
                "summary": "Brief overview of the post content",
                "sentiment": "One of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update",
                "isLegitimate": true,
                "riskLevel": "Assessment of trading risk (low/medium/high)",
                "recommendation": "Personalized recommendation based on user type and risk level"
            }
        `;

        console.log(`[LLM] Sending batch request to Anthropic...`);
        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        console.log(`[LLM] Received batch response from Anthropic`);

        const content = response.content[0].text || "[]";
        const sanitizedContent = this.sanitizeJsonText(content);
        const jsonMatch = sanitizedContent.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "[]";

        console.log(`[LLM] Parsing batch response...`);
        return JSON.parse(jsonStr) as AIInsight[];
    }

    public async generatePostInsights(
        posts: Post[],
        user: User,
        strategies: TradingStrategy[]
    ): Promise<AIInsight[]> {
        console.log(`[LLM] Starting batch analysis for ${posts.length} posts`);
        try {
            const insights = await this.analyzeAllPosts(
                posts,
                user,
                strategies
            );
            console.log(`[LLM] Successfully analyzed ${insights.length} posts`);
            return insights;
        } catch (error) {
            console.error(`[LLM] Error in batch analysis:`, error);
            return [];
        }

        /* Original implementation commented out
        console.log(`[LLM] Starting analysis for ${posts.length} posts`);
        const insights: AIInsight[] = [];

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            console.log(
                `[LLM] Processing post ${post.id} (${i + 1}/${posts.length})`
            );

            try {
                console.log(`[LLM] Getting content analysis...`);
                const analysis = await this.analyzePostContent(
                    post,
                    user,
                    strategies
                );

                console.log(`[LLM] Getting comment analysis...`);
                const sentiment = await this.analyzePostComments(
                    post.engagement.comments
                );

                console.log(`[LLM] Determining final sentiment...`);
                const finalSentiment = this.determinePostSentiment(
                    analysis.sentiment,
                    sentiment
                );
                console.log(`[LLM] Final sentiment: ${finalSentiment}`);

                insights.push({
                    postId: post.id,
                    ...analysis,
                    sentiment: finalSentiment,
                });
                console.log(`[LLM] Added insights for post ${post.id}`);
            } catch (error) {
                console.error(`[LLM] Error analyzing post ${post.id}:`, error);
                // Continue with other posts even if one fails
            }
        }

        console.log(`[LLM] Completed analysis for all posts`);
        return insights;
        */
    }

    private async analyzePostContent(
        post: Post,
        user: User,
        strategies: TradingStrategy[]
    ) {
        console.log(`[LLM] Analyzing content for post ${post.id}`);
        const trimmedPost = this.trimPostContent(post);
        const prompt = `
            Analyze this trading-related post and provide insights based on the user's profile:

            Post Content: ${JSON.stringify(trimmedPost)}
            Post Comments: ${JSON.stringify(
                this.trimComments(post.engagement.comments)
            )}
            User Type: ${user.userType}
            Related Strategies: ${JSON.stringify(strategies)}

            Provide analysis in JSON format with:
            {
                "summary": "Brief overview of the post content",
                "sentiment": "One of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update",
                "isLegitimate": true,
                "riskLevel": "Assessment of trading risk (low/medium/high)",
                "recommendation": "Personalized recommendation based on user type and risk level"
            }
        `;

        console.log(`[LLM] Sending prompt to Anthropic...`);
        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        console.log(`[LLM] Received response from Anthropic`);

        const content = response.content[0].text || "{}";
        const sanitizedContent = this.sanitizeJsonText(content);
        const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

        console.log(`[LLM] Parsed JSON response for post ${post.id}`);
        return JSON.parse(jsonStr) as {
            summary: string;
            sentiment: PostSentiment;
            isLegitimate: boolean;
            riskLevel: string;
            recommendation: string;
        };
    }

    private async analyzePostComments(comments: Comment[]) {
        console.log(`[LLM] Analyzing ${comments.length} comments`);
        if (comments.length === 0) {
            console.log(`[LLM] No comments to analyze, returning neutral`);
            return "neutral";
        }

        const trimmedComments = this.trimComments(comments);
        const prompt = `
            Analyze these trading-related post comments for sentiment:
            ${JSON.stringify(trimmedComments)}

            Provide sentiment analysis in JSON format with:
            {
                "overallSentiment": "positive/neutral/negative",
                "confidence": "0-1 score",
                "keyThemes": ["array of main themes"],
                "riskIndicators": ["array of concerning patterns or none"]
            }
        `;

        console.log(
            `[LLM] Sending prompt to Anthropic for comment analysis...`
        );
        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        console.log(`[LLM] Received comment analysis from Anthropic`);

        const content = response.content[0].text || "{}";
        const sanitizedContent = this.sanitizeJsonText(content);
        const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

        console.log(`[LLM] Parsed JSON response for comment analysis`);
        return JSON.parse(jsonStr);
    }

    private determinePostSentiment(
        contentSentiment: PostSentiment,
        commentSentiment: any
    ): PostSentiment {
        console.log(
            `[LLM] Determining sentiment - Content: ${contentSentiment}, Comments: ${commentSentiment.overallSentiment}`
        );

        // If content is suspicious, prioritize that
        if (
            ["pump_and_dump", "spam", "misleading", "high_risk"].includes(
                contentSentiment
            )
        ) {
            console.log(
                `[LLM] Using suspicious content sentiment: ${contentSentiment}`
            );
            return contentSentiment;
        }

        // If comments show strong negative sentiment, adjust accordingly
        if (
            commentSentiment.overallSentiment === "negative" &&
            commentSentiment.confidence > 0.8 &&
            commentSentiment.riskIndicators.length > 0
        ) {
            console.log(`[LLM] Using negative comment sentiment: misleading`);
            return "misleading";
        }

        console.log(
            `[LLM] Using default content sentiment: ${contentSentiment}`
        );
        return contentSentiment;
    }
}
