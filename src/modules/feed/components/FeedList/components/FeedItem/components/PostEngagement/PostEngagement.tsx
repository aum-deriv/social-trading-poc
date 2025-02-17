import type Post from "@/types/post.types";
import type User from "@/types/user.types";
import CommentSection from "./components/CommentSection/CommentSection";
import Button from "@/components/input/Button";
import "./PostEngagement.css";
import {
    LabelPairedThumbsUpCaptionBoldIcon,
    LegacyShare1pxIcon,
} from "@deriv/quill-icons";

interface PostEngagementProps {
    postId: string;
    content: {
        text: string;
        images?: string[];
    };
    engagement: Post["engagement"];
    currentUserId: string;
    currentUser?: User;
    onLike: () => void;
    onComment: (content: string) => void;
    onShare: () => void;
    onLikeComment?: (commentId: string) => void;
    onReplyToComment: (commentId: string, content: string) => void;
}

const PostEngagement = ({
    engagement,
    currentUserId,
    onLike,
    onComment,
    onShare,
    onLikeComment,
    onReplyToComment,
}: PostEngagementProps) => {
    const { likes, comments, shares } = engagement;
    const isLiked = likes.includes(currentUserId);

    return (
        <div className="post-engagement">
            <div className="post-engagement__stats">
                <span className="post-engagement__stat">
                    {likes.length} likes
                </span>
                <span className="post-engagement__stat">{shares} shares</span>
            </div>

            <div className="post-engagement__actions">
                <Button
                    className={`post-engagement__button ${
                        isLiked ? "post-engagement__button--liked" : ""
                    }`}
                    onClick={onLike}
                    variant="text"
                    icon={<LabelPairedThumbsUpCaptionBoldIcon />}
                >
                    {isLiked ? "Liked" : "Like"}
                </Button>
                <Button
                    className="post-engagement__button"
                    onClick={onShare}
                    variant="text"
                    icon={<LegacyShare1pxIcon iconSize="xs" />}
                >
                    Share
                </Button>
            </div>
            <CommentSection
                comments={comments}
                currentUserId={currentUserId}
                onAddComment={onComment}
                onLikeComment={onLikeComment}
                onReplyToComment={onReplyToComment}
            />
        </div>
    );
};

export default PostEngagement;
