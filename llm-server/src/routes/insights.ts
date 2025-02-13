import express, { Request, Response } from "express";
import { LLMService } from "../services/llm";
import { Post, User, TradingStrategy } from "../types";

const router = express.Router();
const llmService = new LLMService();

interface InsightsRequestBody {
    posts: Post[];
    user: User;
    strategies: TradingStrategy[];
}

router.post(
    "/feed-insights",
    async (req: Request<{}, {}, InsightsRequestBody>, res: Response) => {
        try {
            const { posts, user, strategies } = req.body;

            if (!posts || !Array.isArray(posts)) {
                return res.status(400).json({
                    error: "Invalid request: posts array is required",
                });
            }

            if (!user || typeof user !== "object") {
                return res.status(400).json({
                    error: "Invalid request: user object is required",
                });
            }

            if (!strategies || !Array.isArray(strategies)) {
                return res.status(400).json({
                    error: "Invalid request: strategies array is required",
                });
            }

            const insights = await llmService.generatePostInsights(
                posts,
                user,
                strategies
            );

            res.json({ insights });
        } catch (error) {
            console.error("Error generating insights:", error);
            res.status(500).json({
                error: "Internal server error while generating insights",
            });
        }
    }
);

export default router;
