import Anthropic from "@anthropic-ai/sdk";
import { Post, Comment, AIInsight, User, TradingStrategy } from "../types";
import { PostSentiment } from "../types/sentiment";

interface CommentSentiment {
    overallSentiment: "positive" | "neutral" | "negative";
    confidence: number;
    keyThemes: string[];
    riskIndicators: string[];
}

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
            You are an AI trading insights analyzer. Your task is to analyze trading-related posts and provide insights in a specific JSON format.

            Input:
            - Posts: ${JSON.stringify(postsData)}
            - User Type: ${user.userType}
            - Related Strategies: ${JSON.stringify(strategies)}

            Instructions:
            1. Analyze each post's content and comments
            2. Generate insights following the exact structure below
            3. Return ONLY a JSON array, no other text

            Required JSON format:
            [
                {
                    "postId": "string (must match post's id)",
                    "summary": "string (brief overview)",
                    "sentiment": "string (one of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update)",
                    "isLegitimate": "boolean (true/false)",
                    "riskLevel": "string (one of: low, medium, high)",
                    "recommendation": "string (personalized advice)"
                },
                ...
            ]

            Remember:
            - Return ONLY the JSON array
            - Include ALL required fields for each post
            - Use EXACT values for sentiment and riskLevel
            - Ensure valid JSON syntax
        `;

        console.log(`[LLM] Sending batch request to Anthropic...`);
        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
        });
        console.log(`[LLM] Received batch response from Anthropic`);

        let content = "[]";
        if (
            Array.isArray(response.content) &&
            response.content.length > 0 &&
            response.content[0].text
        ) {
            content = response.content[0].text;
        }

        // Log raw response for debugging
        console.log(`[LLM] Raw response content:`, content);

        const sanitizedContent = this.sanitizeJsonText(content);
        console.log(`[LLM] Sanitized content:`, sanitizedContent);

        // Try to find JSON array in the response
        const jsonMatch = sanitizedContent.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.warn(`[LLM] No JSON array found in response`);
            return []; // Return empty array if no JSON found
        }

        const jsonStr = jsonMatch[0];
        console.log(`[LLM] Extracted JSON string:`, jsonStr);

        let parsedData;
        try {
            parsedData = JSON.parse(jsonStr);
            if (!Array.isArray(parsedData)) {
                console.warn(`[LLM] Parsed data is not an array`);
                return [];
            }
            // Validate each insight has required fields
            parsedData = parsedData.filter((insight) => {
                const isValid =
                    insight.postId &&
                    insight.summary &&
                    insight.sentiment &&
                    typeof insight.isLegitimate === "boolean" &&
                    insight.riskLevel &&
                    insight.recommendation;
                if (!isValid) {
                    console.warn(`[LLM] Invalid insight:`, insight);
                }
                return isValid;
            });
        } catch (e) {
            console.error(
                `[LLM] Error parsing JSON from Anthropic response:`,
                e,
                `\nJSON string:`,
                jsonStr
            );
            return []; // Return empty array on parse error
        }

        console.log(
            `[LLM] Successfully parsed batch response with ${parsedData.length} valid insights`
        );
        return parsedData;
    }

    private async analyzeSinglePost(
        post: Post,
        user: User,
        strategies: TradingStrategy[]
    ): Promise<AIInsight | null> {
        console.log(`[LLM] Analyzing single post ${post.id}`);

        const postData = {
            id: post.id,
            content: this.trimPostContent(post),
            comments: this.trimComments(post.engagement.comments),
        };

        const prompt = `
            You are an AI trading insights analyzer. Your task is to analyze this trading-related post and provide insights in a specific JSON format.

            Input:
            - Post: ${JSON.stringify(postData)}
            - User Type: ${user.userType}
            - Related Strategies: ${JSON.stringify(strategies)}

            Instructions:
            1. Analyze the post's content and comments
            2. Generate insight following the exact structure below
            3. Return ONLY a JSON object, no other text

            Required JSON format:
            {
                "postId": "${post.id}",
                "summary": "string (brief overview, 1 very-short sentence)",
                "sentiment": "string (one of: pump_and_dump, spam, misleading, high_risk, conservative, consistent, verified_strategy, risk_managed, educational, analysis, discussion, update)",
                "isLegitimate": "boolean (true/false)",
                "riskLevel": "string (one of: low, medium, high)",
                "recommendation": "string (personalized advice)"
            }

            Remember:
            - Return ONLY the JSON object
            - Include ALL required fields
            - Use EXACT values for sentiment and riskLevel
            - Ensure valid JSON syntax
        `;

        console.log(`[LLM] Sending request to Anthropic...`);
        const response = await this.anthropic.messages.create({
            model: this.MODEL,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        console.log(`[LLM] Received response from Anthropic`);

        let content = "{}";
        if (
            Array.isArray(response.content) &&
            response.content.length > 0 &&
            response.content[0].text
        ) {
            content = response.content[0].text;
        }

        // Log raw response for debugging
        console.log(`[LLM] Raw response content:`, content);

        const sanitizedContent = this.sanitizeJsonText(content);
        console.log(`[LLM] Sanitized content:`, sanitizedContent);

        // Try to find JSON object in the response
        const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn(`[LLM] No JSON object found in response`);
            return null;
        }

        const jsonStr = jsonMatch[0];
        console.log(`[LLM] Extracted JSON string:`, jsonStr);

        try {
            const parsedData = JSON.parse(jsonStr);

            // Validate insight has required fields
            const isValid =
                parsedData.postId === post.id &&
                parsedData.summary &&
                parsedData.sentiment &&
                typeof parsedData.isLegitimate === "boolean" &&
                parsedData.riskLevel &&
                parsedData.recommendation;

            if (!isValid) {
                console.warn(`[LLM] Invalid insight:`, parsedData);
                return null;
            }

            return parsedData;
        } catch (e) {
            console.error(
                `[LLM] Error parsing JSON from Anthropic response:`,
                e,
                `\nJSON string:`,
                jsonStr
            );
            return null;
        }
    }

    public async generatePostInsight(
        post: Post,
        user: User,
        strategies: TradingStrategy[]
    ): Promise<AIInsight | null> {
        console.log(`[LLM] Starting analysis for post ${post.id}`);
        try {
            const insight = await this.analyzeSinglePost(
                post,
                user,
                strategies
            );
            console.log(`[LLM] Successfully analyzed post ${post.id}`);
            return insight;
        } catch (error) {
            console.error(`[LLM] Error analyzing post ${post.id}:`, error);
            return null;
        }
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

        let content = "{}";
        if (
            Array.isArray(response.content) &&
            response.content.length > 0 &&
            response.content[0].text
        ) {
            content = response.content[0].text;
        }

        const sanitizedContent = this.sanitizeJsonText(content);
        const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        let parsedData;

        try {
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error(
                `[LLM] Error parsing JSON from Anthropic response:`,
                e
            );
            parsedData = {
                summary: "Error analyzing post",
                sentiment: "analysis",
                isLegitimate: true,
                riskLevel: "medium",
                recommendation:
                    "Unable to provide recommendation due to analysis error",
            };
        }

        console.log(`[LLM] Parsed JSON response for post ${post.id}`);
        return parsedData as {
            summary: string;
            sentiment: PostSentiment;
            isLegitimate: boolean;
            riskLevel: string;
            recommendation: string;
        };
    }

    private async analyzePostComments(
        comments: Comment[]
    ): Promise<CommentSentiment> {
        console.log(`[LLM] Analyzing ${comments.length} comments`);
        if (comments.length === 0) {
            console.log(`[LLM] No comments to analyze, returning neutral`);
            return {
                overallSentiment: "neutral",
                confidence: 0,
                keyThemes: [],
                riskIndicators: [],
            };
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

        let content = "{}";
        if (
            Array.isArray(response.content) &&
            response.content.length > 0 &&
            response.content[0].text
        ) {
            content = response.content[0].text;
        }

        const sanitizedContent = this.sanitizeJsonText(content);
        const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        let parsedData;

        try {
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error(
                `[LLM] Error parsing JSON from Anthropic response:`,
                e
            );
            parsedData = {
                overallSentiment: "neutral",
                confidence: 0,
                keyThemes: [],
                riskIndicators: [],
            };
        }

        console.log(`[LLM] Parsed JSON response for comment analysis`);
        return parsedData;
    }

    private determinePostSentiment(
        contentSentiment: PostSentiment,
        commentSentiment: CommentSentiment
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
