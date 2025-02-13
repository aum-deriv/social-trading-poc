import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "@/layouts/Header";
import AppContent from "@/layouts/AppContent";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PostForm from "@/modules/feed/components/PostForm";
import { useAuth } from "@/context/AuthContext";
import useCurrentUser from "@/modules/feed/hooks/useCurrentUser";
import "./MainLayout.css";

const MainLayout = () => {
    const { user } = useAuth();
    const { user: userDetails } = useCurrentUser(user?.id || "");
    const [showPostForm, setShowPostForm] = useState(false);

    return (
        <div className="main-layout">
            <Header />
            <AppContent>
                <Outlet />
            </AppContent>
            {showPostForm && userDetails && (
                <PostForm
                    currentUser={userDetails}
                    onSubmit={async () => {
                        // Handle post submit
                        setShowPostForm(false);
                    }}
                    onClose={() => setShowPostForm(false)}
                />
            )}
            <BottomNavigation onCreatePost={() => setShowPostForm(true)} />
        </div>
    );
};

export default MainLayout;
