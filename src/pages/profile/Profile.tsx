import { useParams } from "react-router-dom";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import ProfileHeader from "../../modules/profile/components/ProfileHeader";
import FeedList from "@/modules/feed/components/FeedList";
import "./Profile.css";

const Profile = () => {
    const { username = "" } = useParams();
    const {
        profile,
        isOwnProfile,
        isFollowing,
        loading,
        error,
        handleFollow,
        handleUnfollow
    } = useProfile(username);

    if (loading || !profile) {
        return (
            <div className="profile-page">
                <div className="profile-page__loading">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-page__error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
            />
            <div className="profile-page__content">
                <div className="profile-page__feed">
                    <FeedList
                        currentUserId={profile.id}
                        activeTab="profile"
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
