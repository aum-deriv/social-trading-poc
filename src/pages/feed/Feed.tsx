import { useState } from "react";
import FeedList from "@modules/feed/components/FeedList";
import TabNavigation from "@/components/navigation/TabNavigation/TabNavigation";
import { useAuth } from "@/context/AuthContext";
import "./Feed.css";

const Feed = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("For you");

    if (authLoading || !user) {
        return (
            <div className="feed-page">
                <TabNavigation
                    tabs={["For you", "Following"]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="feed-page__container">
                    <div className="feed-page__loading">Loading...</div>
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
                        currentUserId={user.id}
                        activeTab={activeTab}
                    />
                </main>
            </div>
        </div>
    );
};

export default Feed;
