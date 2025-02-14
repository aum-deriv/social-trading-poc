import { useState } from "react";
import type { Comment } from "@/types/post.types";
import Avatar from "@/components/user/Avatar";
import { useUser } from "@/modules/feed/hooks/useUser";
import "./CommentItem.css";
import Button from "@/components/input/Button";

interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onLike?: () => void;
    onLikeComment?: (commentId: string) => void;
    onReply: () => void;
}

const CommentItem = ({
    comment,
    currentUserId,
    onLike,
    onLikeComment,
    onReply,
}: CommentItemProps) => {
    const [showReplies, setShowReplies] = useState(false);
    const isLiked = comment.likes.includes(currentUserId);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const { user, loading } = useUser(comment.userId);

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
                <Avatar 
                    size="small" 
                    username={user?.displayName?.split('|')[0].trim() || comment.userId}
                    src={user?.profilePicture}
                />
            </div>
            <div className="comment-item__content">
                <div className="comment-item__header">
                    <span className="comment-item__username">
                        {loading ? `@${comment.userId}` : user?.displayName ? user.displayName.split('|')[0].trim() : `@${comment.userId}`}
                    </span>
                    <span className="comment-item__timestamp">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
                <p className="comment-item__text">{comment.content}</p>
                <div className="comment-item__actions">
                    {onLike && (
                        <Button
                            className={`comment-item__action ${
                                isLiked ? "comment-item__action--liked" : ""
                            }`}
                            onClick={onLike}
                            variant="text"
                        >
                            {isLiked ? "Liked" : "Like"} ·{" "}
                            {comment.likes.length}
                        </Button>
                    )}
                    <Button
                        className="comment-item__action"
                        onClick={onReply}
                        variant="text"
                    >
                        Reply
                    </Button>
                    {hasReplies && (
                        <Button
                            className="comment-item__action"
                            onClick={toggleReplies}
                            variant="text"
                        >
                            {showReplies ? "Hide" : "Show"} replies (
                            {comment.replies?.length})
                        </Button>
                    )}
                </div>
                {showReplies && comment.replies && (
                    <div className="comment-item__replies">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                onLike={
                                    onLikeComment
                                        ? () => onLikeComment(reply.id)
                                        : undefined
                                }
                                onLikeComment={onLikeComment}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
