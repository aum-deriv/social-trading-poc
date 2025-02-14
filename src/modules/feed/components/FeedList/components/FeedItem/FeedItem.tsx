import { useState, useRef, useEffect } from "react";
import type Post from "@/types/post.types";
import type User from "@/types/user.types";
import type { AIInsight } from "@/types/ai.types";
import PostHeader from "./components/PostHeader";
import PostContent from "./components/PostContent";
import PostEngagement from "./components/PostEngagement";
import PostAIInsights from "./components/PostAIInsights/PostAIInsights";
import {
    useAddComment,
    useAddReply,
    useLikeComment,
} from "@/modules/feed/hooks/usePostActions";
import { usePostInsight } from "@/modules/feed/hooks/usePostInsight";
import "./FeedItem.css";

interface FeedItemProps {
    post: Post;
    user?: User;
    currentUserId: string;
    insight?: AIInsight;
}

const FeedItem = ({
    post,
    user,
    currentUserId,
    insight: initialInsight,
}: FeedItemProps) => {
    const [engagement, setEngagement] = useState(post.engagement);
    const [insight, setInsight] = useState<AIInsight | undefined>(
        initialInsight
    );
    const [shouldAnalyze, setShouldAnalyze] = useState(false);
    const insightsRef = useRef<HTMLDivElement>(null);

    const { insight: newInsight, isLoading: isAnalyzing } = usePostInsight(
        currentUserId,
        post.id,
        shouldAnalyze
    );

    useEffect(() => {
        if (newInsight) {
            setInsight(newInsight);
            // Wait for state update and DOM render
            setTimeout(() => {
                insightsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [newInsight]);

    const handleAnalyze = () => {
        setShouldAnalyze(true);
    };

    const handleLike = () => {
        const isLiked = engagement.likes.includes(currentUserId);
        const newLikes = isLiked
            ? engagement.likes.filter((id) => id !== currentUserId)
            : [...engagement.likes, currentUserId];

        setEngagement({
            ...engagement,
            likes: newLikes,
        });
    };

    const { addComment } = useAddComment(post.id);
    const { likeComment } = useLikeComment(post.id);
    const { addReply } = useAddReply(post.id);

    const handleComment = async (content: string) => {
        try {
            const updatedPost = await addComment(currentUserId, content);
            if (updatedPost) {
                setEngagement(updatedPost.engagement);
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            const updatedPost = await likeComment(commentId, currentUserId);
            if (updatedPost) {
                setEngagement(updatedPost.engagement);
            }
        } catch (error) {
            console.error("Failed to like comment:", error);
        }
    };

    const handleReplyToComment = async (commentId: string, content: string) => {
        try {
            const updatedPost = await addReply(
                commentId,
                currentUserId,
                content
            );
            if (updatedPost) {
                setEngagement(updatedPost.engagement);
            }
        } catch (error) {
            console.error("Failed to add reply:", error);
        }
    };

    const handleShare = () => {
        setEngagement({
            ...engagement,
            shares: engagement.shares + 1,
        });
    };

    return (
        <article className="feed-item">
            {user && (
                <PostHeader
                    user={user}
                    timestamp={post.createdAt}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    showAnalyzeButton={!insight}
                />
            )}
            <PostContent content={post.content} />
            {/* Only render PostAIInsights if we have a valid insight */}
            {insight && insight.sentiment && (
                <PostAIInsights
                    ref={insightsRef}
                    insight={insight}
                    userType={user?.userType ?? "copier"}
                    onCopyTrader={() => {
                        /* TODO: Implement copy trader */
                    }}
                />
            )}
            <PostEngagement
                postId={post.id}
                content={post.content}
                engagement={engagement}
                currentUserId={currentUserId}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
                onReplyToComment={handleReplyToComment}
                onLikeComment={handleLikeComment}
                onShare={handleShare}
            />
        </article>
    );
};

export default FeedItem;
