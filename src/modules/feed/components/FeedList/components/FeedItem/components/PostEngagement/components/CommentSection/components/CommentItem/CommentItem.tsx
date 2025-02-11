import { useState } from "react";
import type { Comment } from "@/types/post.types";
import "./CommentItem.css";

interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onLike: () => void;
    onReply: () => void;
}

const CommentItem = ({
    comment,
    currentUserId,
    onLike,
    onReply,
}: CommentItemProps) => {
    const [showReplies, setShowReplies] = useState(false);
    const isLiked = comment.likes.includes(currentUserId);
    const hasReplies = comment.replies && comment.replies.length > 0;

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

    return (
        <div className="comment-item">
            <div className="comment-item__avatar">
                {/* Placeholder avatar */}
                <div className="comment-item__avatar-placeholder" />
            </div>
            <div className="comment-item__content">
                <div className="comment-item__header">
                    <span className="comment-item__username">
                        @{comment.userId}
                    </span>
                    <span className="comment-item__timestamp">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
                <p className="comment-item__text">{comment.content}</p>
                <div className="comment-item__actions">
                    <button
                        className={`comment-item__action ${
                            isLiked ? "comment-item__action--liked" : ""
                        }`}
                        onClick={onLike}
                    >
                        {isLiked ? "Liked" : "Like"} · {comment.likes.length}
                    </button>
                    <button className="comment-item__action" onClick={onReply}>
                        Reply
                    </button>
                    {hasReplies && (
                        <button
                            className="comment-item__action"
                            onClick={toggleReplies}
                        >
                            {showReplies ? "Hide" : "Show"} replies (
                            {comment.replies?.length})
                        </button>
                    )}
                </div>
                {showReplies && comment.replies && (
                    <div className="comment-item__replies">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                onLike={() => {}}
                                onReply={() => {}}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
