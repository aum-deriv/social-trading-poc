import { useState } from 'react';
import type { Comment } from '@/types/post.types';
import type User from '@/types/user.types';
import CommentItem from './components/CommentItem/CommentItem';
import CommentInput from './components/CommentInput/CommentInput';
import './CommentSection.css';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: string;
  currentUser?: User;
  onAddComment: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

const CommentSection = ({
  comments,
  currentUserId,
  currentUser,
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
        currentUser={currentUser}
      />
      <div className="comment-section__divider" />
      {comments.length > 0 ? (
        <div className="comment-section__count">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      ) : (
        <div className="comment-section__empty">No comments</div>
      )}
      <div className="comment-section__list">
        {comments.map(comment => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              currentUser={currentUser}
              onLike={onLikeComment ? () => onLikeComment(comment.id) : undefined}
              onLikeComment={onLikeComment}
              onReply={() => handleReply(comment.id)}
            />
            {replyingTo === comment.id && (
              <div className="comment-section__reply-input">
                <CommentInput
                  onSubmit={handleSubmitReply}
                  placeholder="Write a reply..."
                  currentUserId={currentUserId}
                  currentUser={currentUser}
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
