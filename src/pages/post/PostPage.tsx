import { useState, useEffect } from 'react';
import type Post from '@/types/post.types';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import FeedItem from '@/modules/feed/components/FeedList/components/FeedItem';
import { getPost } from '@/modules/feed/services/postService';
import AILoader from '@/components/AILoader';
import BackIcon from '@/assets/icons/BackIcon';
import './PostPage.css';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { users, getUser } = useUsers();

  useEffect(() => {
    if (authUser && !users[authUser.id]) {
      getUser(authUser.id);
    }
  }, [authUser, users, getUser]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const data = await getPost(postId);
        setPost(data);
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="post-page">
        <header className="post-page__header">
          <button onClick={handleBack} className="post-page__back">
            <BackIcon />
          </button>
          <h1 className="post-page__title">Post</h1>
        </header>
        <div className="post-page__loading">
          <AILoader size={40} />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-page">
        <header className="post-page__header">
          <button onClick={handleBack} className="post-page__back">
            <BackIcon />
          </button>
          <h1 className="post-page__title">Post</h1>
        </header>
        <div className="post-page__error">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <header className="post-page__header">
        <button onClick={handleBack} className="post-page__back">
          <BackIcon />
        </button>
        <h1 className="post-page__title">Post</h1>
      </header>
      <main className="post-page__content">
        {authUser && users[authUser.id] && (
          <FeedItem
            post={post}
            currentUserId={authUser.id}
            currentUser={users[authUser.id]}
            showComments={true}
          />
        )}
      </main>
    </div>
  );
};

export default PostPage;
