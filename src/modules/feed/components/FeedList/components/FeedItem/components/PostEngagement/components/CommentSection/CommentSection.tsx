import { useState } from "react";
import type { Comment } from "@/types/post.types";
import CommentItem from "./components/CommentItem/CommentItem";
import CommentInput from "./components/CommentInput/CommentInput";
import "./CommentSection.css";

interface CommentSectionProps {
    comments: Comment[];
    currentUserId: string;
    onAddComment: (content: string) => void;
    onLikeComment?: (commentId: string) => void;
    onReplyToComment: (commentId: string, content: string) => void;
}

const CommentSection = ({
    comments,
    currentUserId,
    onAddComment,
    onLikeComment,
    onReplyToComment,
}: CommentSectionProps) => {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
    };

    const handleSubmitReply = (content: string) => {
        if (replyingTo) {
            onReplyToComment(replyingTo, content);
            setReplyingTo(null);
        }
    };

    return (
        <div className="comment-section">
            <CommentInput 
                onSubmit={onAddComment}
                currentUserId={currentUserId}
            />
            <div className="comment-section__divider" />
            {comments.length > 0 ? (
                <div className="comment-section__count">
                    {comments.length}{" "}
                    {comments.length === 1 ? "comment" : "comments"}
                </div>
            ) : (
                <div className="comment-section__empty">No comments</div>
            )}
            <div className="comment-section__list">
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <CommentItem
                            comment={comment}
                            currentUserId={currentUserId}
                            onLike={
                                onLikeComment
                                    ? () => onLikeComment(comment.id)
                                    : undefined
                            }
                            onLikeComment={onLikeComment}
                            onReply={() => handleReply(comment.id)}
                        />
                        {replyingTo === comment.id && (
                            <div className="comment-section__reply-input">
                                <CommentInput
                                    onSubmit={handleSubmitReply}
                                    placeholder="Write a reply..."
                                    currentUserId={currentUserId}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
