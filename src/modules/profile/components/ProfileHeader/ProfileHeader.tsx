import { useState } from "react";
import type User from "@/types/user.types";
import Button from "@/components/input/Button";
import { useAuth } from "@/context/AuthContext";
import FullscreenModal from "@/components/modal/FullscreenModal/FullscreenModal";
import UserList from "../UserList/UserList";
import StrategyList from "../StrategyList/StrategyList";
import { useFollowers } from "../../hooks/useFollowers";
import { followUser, unfollowUser } from "../../services/profileService";
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
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showStrategies, setShowStrategies] = useState(false);
    const { user: currentUser } = useAuth();
    const { 
        username, 
        profilePicture, 
        userType, 
        followers = [], 
        following = [],
        strategies = []
    } = profile;
    const followersCount = followers.filter(id => id !== currentUser?.id).length;
    const followingCount = following.length;
    const strategiesCount = strategies.length;
    const { users: followerUsers, loading: loadingFollowers, refetch: refetchFollowers } = useFollowers(followers);
    const { users: followingUsers, loading: loadingFollowing, refetch: refetchFollowing } = useFollowers(following);

    return (
        <div className="profile-header">
            <div className="profile-header__main">
                <img
                    src={profilePicture || "/default-avatar.png"}
                    alt={username}
                    className="profile-header__avatar"
                />
                <div className="profile-header__info">
                    <div className="profile-header__name-row">
                        <h1 className="profile-header__username">{username}</h1>
                        {!isOwnProfile && (
                            <Button
                                onClick={isFollowing ? onUnfollow : onFollow}
                                variant={isFollowing ? "secondary" : "primary"}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                        {isOwnProfile && userType === "copier" && (
                            <Button variant="secondary">
                                Upgrade to Leader
                            </Button>
                        )}
                    </div>
                    <div className="profile-header__stats">
                        <div 
                            className="profile-header__stat"
                            onClick={() => setShowFollowers(true)}
                        >
                            <span className="profile-header__stat-value">{followersCount}</span>
                            <span className="profile-header__stat-label">followers</span>
                        </div>
                        <div 
                            className="profile-header__stat"
                            onClick={() => setShowFollowing(true)}
                        >
                            <span className="profile-header__stat-value">{followingCount}</span>
                            <span className="profile-header__stat-label">following</span>
                        </div>
                        <div 
                            className="profile-header__stat"
                            onClick={() => setShowStrategies(true)}
                        >
                            <span className="profile-header__stat-value">{strategiesCount}</span>
                            <span className="profile-header__stat-label">strategies</span>
                        </div>
                    </div>
                    <div className="profile-header__type">
                        <span className={`profile-header__badge profile-header__badge--${userType}`}>
                            {userType}
                        </span>
                    </div>
                    {userType === "leader" && profile.performance && (
                        <div className="profile-header__performance">
                            <div className="profile-header__performance-stat">
                                <span className="profile-header__performance-label">Win Rate</span>
                                <span className="profile-header__performance-value">
                                    {profile.performance.winRate}%
                                </span>
                            </div>
                            <div className="profile-header__performance-stat">
                                <span className="profile-header__performance-label">Total PnL</span>
                                <span className={`profile-header__performance-value profile-header__performance-value--${profile.performance.totalPnL > 0 ? 'positive' : 'negative'}`}>
                                    {profile.performance.totalPnL > 0 ? '+' : ''}{profile.performance.totalPnL}%
                                </span>
                            </div>
                            <div className="profile-header__performance-stat">
                                <span className="profile-header__performance-label">Monthly Return</span>
                                <span className={`profile-header__performance-value profile-header__performance-value--${profile.performance.monthlyReturn > 0 ? 'positive' : 'negative'}`}>
                                    {profile.performance.monthlyReturn > 0 ? '+' : ''}{profile.performance.monthlyReturn}%
                                </span>
                            </div>
                            <div className="profile-header__performance-stat">
                                <span className="profile-header__performance-label">Total Trades</span>
                                <span className="profile-header__performance-value">
                                    {profile.performance.totalTrades}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <FullscreenModal
                isOpen={showFollowers}
                onClose={() => {
                    setShowFollowers(false);
                    onFollow(); // Refetch profile data when modal closes
                }}
                title="Followers"
            >
                {loadingFollowers ? (
                    <div className="user-list--loading">Loading followers...</div>
                ) : (
                    <UserList
                        users={followerUsers}
                        currentUserId={currentUser?.id}
                        onFollowUser={async (userId) => {
                            if (currentUser?.id) {
                                await followUser(currentUser.id, userId);
                                await refetchFollowers();
                            }
                        }}
                        onUnfollowUser={async (userId) => {
                            if (currentUser?.id) {
                                await unfollowUser(currentUser.id, userId);
                                await refetchFollowers();
                            }
                        }}
                        listType="followers"
                    />
                )}
            </FullscreenModal>

            <FullscreenModal
                isOpen={showFollowing}
                onClose={() => {
                    setShowFollowing(false);
                    onFollow(); // Refetch profile data when modal closes
                }}
                title="Following"
            >
                {loadingFollowing ? (
                    <div className="user-list--loading">Loading following...</div>
                ) : (
                    <UserList
                        users={followingUsers}
                        currentUserId={currentUser?.id}
                        onFollowUser={async (userId) => {
                            if (currentUser?.id) {
                                await followUser(currentUser.id, userId);
                                await refetchFollowing();
                            }
                        }}
                        onUnfollowUser={async (userId) => {
                            if (currentUser?.id) {
                                await unfollowUser(currentUser.id, userId);
                                await refetchFollowing();
                            }
                        }}
                        listType="following"
                    />
                )}
            </FullscreenModal>

            <FullscreenModal
                isOpen={showStrategies}
                onClose={() => setShowStrategies(false)}
                title="Strategies"
            >
                <StrategyList
                    strategies={strategies}
                    onCopyStrategy={async (strategyId) => {
                        // TODO: Implement copy strategy
                        console.log('Copy strategy:', strategyId);
                    }}
                />
            </FullscreenModal>
        </div>
    );
};

export default ProfileHeader;
