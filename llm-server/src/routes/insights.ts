import express, { Request, Response } from "express";
import { LLMService } from "../services/llm";
import { DataService } from "../services/data";

const router = express.Router();
const llmService = new LLMService();
const dataService = new DataService();

router.get(
    "/feed-insights/:userId",
    async (req: Request<{ userId: string }>, res: Response) => {
        try {
            const { userId } = req.params;

            const user = dataService.getUser(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const posts = dataService.getUserPosts();
            const strategies = dataService.getUserStrategies(userId);

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
