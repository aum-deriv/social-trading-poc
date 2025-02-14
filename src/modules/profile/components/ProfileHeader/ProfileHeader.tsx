import type User from "@/types/user.types";
import ProfileBasicInfo from "./components/ProfileBasicInfo";
import ProfileActions from "./components/ProfileActions";
import ProfileStats from "./components/ProfileStats";
import ProfileBadge from "./components/ProfileBadge";
import ProfilePerformance from "./components/ProfilePerformance";
import "./ProfileHeader.css";

interface ProfileHeaderProps {
    profile: User;
    isOwnProfile: boolean;
    isFollowing: boolean;
    onFollow: () => Promise<void>;
    onUnfollow: () => Promise<void>;
}

const ProfileHeader = ({
    profile,
    isOwnProfile,
    isFollowing,
    onFollow,
    onUnfollow
}: ProfileHeaderProps) => {
    const { 
        username, 
        profilePicture, 
        userType, 
        followers = [], 
        following = [],
        strategies = [],
        displayName
    } = profile;

    return (
        <div className="profile-header">
            <div className="profile-header__main">
                <div className="profile-header__info">
                    <div className="profile-header__name-row">
                        <ProfileBasicInfo
                            username={username}
                            displayName={displayName}
                            profilePicture={profilePicture}
                        />
                        <ProfileActions
                            isOwnProfile={isOwnProfile}
                            isFollowing={isFollowing}
                            userType={userType}
                            onFollow={onFollow}
                            onUnfollow={onUnfollow}
                        />
                    </div>
                    <ProfileStats
                        followers={followers}
                        following={following}
                        strategies={strategies}
                        onFollowAction={onFollow}
                    />
                    <ProfileBadge userType={userType} />
                    {userType === "leader" && profile.performance && (
                        <ProfilePerformance performance={profile.performance} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
