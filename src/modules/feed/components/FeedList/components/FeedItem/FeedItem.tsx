import { useState } from "react";
import type Post from "@/types/post.types";
import type User from "@/types/user.types";
import PostHeader from "./components/PostHeader";
import PostContent from "./components/PostContent";
import PostEngagement from "./components/PostEngagement";
import {
    addComment,
    addReply,
    likeComment,
} from "@/modules/feed/services/postService";
import "./FeedItem.css";

interface FeedItemProps {
    post: Post;
    user: User;
    currentUserId: string;
}

const FeedItem = ({ post, user, currentUserId }: FeedItemProps) => {
    const [engagement, setEngagement] = useState(post.engagement);

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

    const handleComment = async (content: string) => {
        try {
            const updatedPost = await addComment(post.id, {
                userId: currentUserId,
                content,
            });
            setEngagement(updatedPost.engagement);
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            const updatedPost = await likeComment(
                post.id,
                commentId,
                currentUserId
            );
            setEngagement(updatedPost.engagement);
        } catch (error) {
            console.error("Failed to like comment:", error);
        }
    };

    const handleReplyToComment = async (commentId: string, content: string) => {
        try {
            const updatedPost = await addReply(post.id, {
                userId: currentUserId,
                content,
                commentId,
            });
            setEngagement(updatedPost.engagement);
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
            <PostHeader user={user} timestamp={post.createdAt} />
            <PostContent content={post.content} />
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
