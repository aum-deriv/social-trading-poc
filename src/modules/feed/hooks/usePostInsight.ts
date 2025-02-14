import { useQueryAI } from "@hooks/ai";
import { AIInsight } from "@/types/ai.types";

interface SingleInsightResponse {
    insight: AIInsight;
}

export const usePostInsight = (
    userId: string,
    postId: string,
    enabled: boolean = false
) => {
    const { data, error, isLoading } = useQueryAI<SingleInsightResponse>(
        `api/ai/post-insight/${userId}/${postId}`,
        { enabled }
    );

    return {
        insight: data?.insight ?? null,
        error,
        isLoading,
    };
};
