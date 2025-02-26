import { useState, useEffect } from 'react';
import type Post from '@/types/post.types';
import FeedItem from './components/FeedItem';
import { getPosts } from '../../services/postService';
import AILoader from '@/components/AILoader';
import ErrorState from '@/components/feedback/ErrorState';
import './FeedList.css';
import type User from '@/types/user.types';

interface FeedListProps {
  currentUserId: string;
  currentUser: User;
  activeTab: string;
  shouldRefresh?: boolean;
  onRefreshComplete?: () => void;
}

const FeedList = ({
  currentUserId,
  currentUser,
  activeTab,
  shouldRefresh,
  onRefreshComplete,
}: FeedListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getPosts(activeTab, currentUserId);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when activeTab changes
  useEffect(() => {
    fetchPosts();
  }, [activeTab, currentUserId]);

  // Handle refresh separately
  useEffect(() => {
    if (shouldRefresh) {
      fetchPosts().then(() => {
        onRefreshComplete?.();
      });
    }
  }, [shouldRefresh]);

  if (loading) {
    return <AILoader size={40} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          fetchPosts();
        }}
      />
    );
  }

  return (
    <div className="feed-list">
      {posts.length > 0 ? (
        [...posts]
          .reverse()
          .map(post => (
            <FeedItem
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              currentUser={currentUser}
            />
          ))
      ) : (
        <div className="feed-list__empty">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 11a9 9 0 0 1 9 9"></path>
            <path d="M4 4a16 16 0 0 1 16 16"></path>
            <circle cx="5" cy="19" r="1"></circle>
          </svg>
          <p>No posts to show</p>
          {activeTab === 'Following' && (
            <p className="feed-list__empty-subtitle">
              Follow other traders to see their posts here
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedList;
