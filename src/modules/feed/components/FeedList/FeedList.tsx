import FeedItem from "./components/FeedItem";
import { usePosts } from "../../hooks/usePosts";
import { useUsers } from "../../hooks/useUsers";
import "./FeedList.css";

interface FeedListProps {
    currentUserId: string;
    activeTab: string;
}

const FeedList = ({ currentUserId, activeTab }: FeedListProps) => {
    const { users, error: usersError, isLoading: loadingUsers } = useUsers();
    const {
        posts,
        error: postsError,
        isLoading: loadingPosts,
    } = usePosts(activeTab, currentUserId);

    const loading = loadingUsers || loadingPosts;
    const error = usersError || postsError;

    if (loading) {
        return <div className="feed-list__loading">Loading posts...</div>;
    }

    if (error) {
        return <div className="feed-list__error">{error.message}</div>;
    }

    return (
        <div className="feed-list">
            {posts?.length > 0 ? (
                posts.map((post) => (
                    <FeedItem
                        key={post.id}
                        post={post}
                        user={users?.[post.userId]}
                        currentUserId={currentUserId}
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
                    {activeTab === "Following" && (
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
