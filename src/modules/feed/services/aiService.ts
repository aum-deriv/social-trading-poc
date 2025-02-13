import { AIInsight } from "@/types/ai.types";

interface AIResponse {
    insights: AIInsight[];
}

export const getPostInsights = async (userId: string): Promise<AIInsight[]> => {
    try {
        const response = await fetch(
            `http://localhost:3002/api/ai/feed-insights/${userId}`
        );
        if (!response.ok) {
            console.warn(`AI insights service error: ${response.status}`);
            return [];
        }
        const data: AIResponse = await response.json();

        // Validate insights array
        if (!data.insights || !Array.isArray(data.insights)) {
            console.warn("Invalid insights response:", data);
            return [];
        }

        // Filter out invalid insights
        const validInsights = data.insights.filter(
            (insight) =>
                insight &&
                insight.postId &&
                insight.sentiment &&
                insight.summary &&
                typeof insight.isLegitimate === "boolean" &&
                insight.riskLevel &&
                insight.recommendation
        );

        if (validInsights.length < data.insights.length) {
            console.warn(
                `Filtered out ${
                    data.insights.length - validInsights.length
                } invalid insights`
            );
        }

        return validInsights;
    } catch (error) {
        console.error("AI insights service error:", error);
        return [];
    }
};
