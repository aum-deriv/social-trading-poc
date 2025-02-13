import { useState, useEffect } from "react";
import type Post from "@/types/post.types";
import type User from "@/types/user.types";
import FeedItem from "./components/FeedItem";
import { getPosts } from "../../services/postService";
import "./FeedList.css";

interface FeedListProps {
    currentUserId: string;
    activeTab: string;
}

const FeedList = ({ currentUserId, activeTab }: FeedListProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [usersCache, setUsersCache] = useState<{ [key: string]: User } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch and cache users only when currentUserId changes
    useEffect(() => {
        async function fetchUsers() {
            if (!usersCache) {
                try {
                    setLoading(true);
                    const response = await fetch("http://localhost:3001/users");
                    if (!response.ok) {
                        throw new Error("Failed to fetch users");
                    }
                    const usersData: User[] = await response.json();

                    // Create a map of users for quick lookup
                    const usersMap = usersData.reduce((acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    }, {} as { [key: string]: User });

                    setUsersCache(usersMap);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "An error occurred");
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchUsers();
    }, [currentUserId]);

    // Only fetch posts when activeTab changes
    useEffect(() => {
        async function fetchPosts() {
            try {
                setLoading(true);
                const postsData = await getPosts(activeTab, currentUserId);
                setPosts(postsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        // Only fetch posts if we have the users cache
        if (usersCache) {
            fetchPosts();
        }
    }, [activeTab, currentUserId, usersCache]);

    if (loading) {
        return <div className="feed-list__loading">Loading posts...</div>;
    }

    if (error) {
        return <div className="feed-list__error">{error}</div>;
    }

    return (
        <div className="feed-list">
            {posts.length > 0 ? (
                posts.map((post) => (
                    <FeedItem
                        key={post.id}
                        post={post}
                        user={usersCache?.[post.userId]}
                        currentUserId={currentUserId}
                    />
                ))
            ) : (
                <div className="feed-list__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
