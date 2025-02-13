import { AIInsight } from "@/types/ai.types";

interface SingleInsightResponse {
    insight: AIInsight;
}

export const getPostInsight = async (
    userId: string,
    postId: string
): Promise<AIInsight | null> => {
    try {
        const response = await fetch(
            `http://localhost:3002/api/ai/post-insight/${userId}/${postId}`
        );
        if (!response.ok) {
            console.warn(`AI insight service error: ${response.status}`);
            return null;
        }
        const data: SingleInsightResponse = await response.json();

        // Validate insight
        if (!data.insight || !data.insight.sentiment) {
            console.warn("Invalid insight response:", data);
            return null;
        }

        return data.insight;
    } catch (error) {
        console.error("AI insight service error:", error);
        return null;
    }
};
