import { useState, useRef } from 'react';
import type Post from '@/types/post.types';
import type User from '@/types/user.types';
import type { AIInsight } from '@/types/ai.types';
import PostHeader from './components/PostHeader';
import PostContent from './components/PostContent';
import PostEngagement from './components/PostEngagement';
import PostAIInsights from './components/PostAIInsights/PostAIInsights';
import {
  addComment,
  addReply,
  likeComment,
  likePost,
  sharePost,
} from '@/modules/feed/services/postService';
import { getPostInsight } from '@/modules/feed/services/aiService';
import './FeedItem.css';
import TranslateButton from '@/components/TranslateButton';

interface FeedItemProps {
  post: Post;
  user?: User;
  currentUserId: string;
  insight?: AIInsight;
}

const FeedItem = ({ post, user, currentUserId, insight: initialInsight }: FeedItemProps) => {
  const [engagement, setEngagement] = useState(post.engagement);
  const [insight, setInsight] = useState<AIInsight | undefined>(initialInsight);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const insightsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const newInsight = await getPostInsight(currentUserId, post.id);
      if (newInsight) {
        setInsight(newInsight);
        // Wait for state update and DOM render
        setTimeout(() => {
          insightsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to analyze post:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLike = async () => {
    try {
      const updatedPost = await likePost(post.id, currentUserId);
      setEngagement(updatedPost.engagement);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (content: string) => {
    try {
      const updatedPost = await addComment(post.id, {
        userId: currentUserId,
        content,
      });
      setEngagement(updatedPost.engagement);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const updatedPost = await likeComment(post.id, commentId, currentUserId);
      setEngagement(updatedPost.engagement);
    } catch (error) {
      console.error('Failed to like comment:', error);
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
      console.error('Failed to add reply:', error);
    }
  };

  const handleShare = async () => {
    try {
      const updatedPost = await sharePost(post.id);
      setEngagement(updatedPost.engagement);
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  return (
    <article className="feed-item">
      {user && (
        <PostHeader
          user={user}
          timestamp={post.createdAt}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          showAnalyzeButton={!insight && post.userId !== currentUserId}
        />
      )}
      <PostContent content={post.content} translatedText={translatedText} />
      {/* Only render PostAIInsights if we have a valid insight */}
      {insight && insight.sentiment && (
        <PostAIInsights
          ref={insightsRef}
          insight={insight}
          userType={user?.userType ?? 'copier'}
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
        translationButton={
          <TranslateButton
            text={post.content.text}
            language={post?.language ?? 'EN'}
            onTranslation={(text: string) => {
              setTranslatedText(text);
            }}
          />
        }
      />
    </article>
  );
};

export default FeedItem;
