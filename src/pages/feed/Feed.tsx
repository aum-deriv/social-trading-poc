import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useCurrentUser from "@/modules/feed/hooks/useCurrentUser";
import TabNavigation from "@/components/navigation/TabNavigation/TabNavigation";
import FeedList from "@/modules/feed/components/FeedList/FeedList";
import PostForm from "@/modules/feed/components/PostForm";
import Loader from "@/components/layout/Loader";
import PlusIcon from "@/assets/icons/Plus";
import { createPost } from "@/modules/feed/services/postService";
import "./Feed.css";

const Feed = () => {
    const { user, loading: authLoading } = useAuth();
    const { user: userDetails } = useCurrentUser(user?.id || "");
    const [activeTab, setActiveTab] = useState("For you");
    const [showPostForm, setShowPostForm] = useState(false);
    const [shouldRefresh, setShouldRefresh] = useState(false);

    if (authLoading || !user) {
        return (
            <div className="feed-page__container">
                <div className="feed-page__loading">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <TabNavigation
                tabs={["For you", "Following"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div className="feed-page__container">
                <main>
                    <FeedList
                        activeTab={activeTab}
                        currentUserId={user.id}
                        shouldRefresh={shouldRefresh}
                        onRefreshComplete={() => setShouldRefresh(false)}
                    />
                </main>
                <button
                    className="feed-page__fab"
                    onClick={() => setShowPostForm(true)}
                    aria-label="Create post"
                >
                    <PlusIcon />
                </button>
            </div>
            {showPostForm && userDetails && (
                <PostForm
                    currentUser={userDetails}
                    onSubmit={async (content) => {
                        try {
                            await createPost({
                                userId: userDetails.id,
                                content,
                            });
                            setShouldRefresh(true);
                            setShowPostForm(false);
                        } catch (error) {
                            console.error("Failed to create post:", error);
                            // TODO: Show error message
                        }
                    }}
                    onClose={() => setShowPostForm(false)}
                />
            )}
        </div>
    );
};

export default Feed;
