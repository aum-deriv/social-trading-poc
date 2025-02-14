import { useState } from "react";
import type Strategy from "@/types/strategy.types";
import { useAuth } from "@/context/AuthContext";
import FullscreenModal from "@/components/modal/FullscreenModal/FullscreenModal";
import UserList from "../../../UserList/UserList";
import StrategyList from "../../../StrategyList/StrategyList";
import { useFollowers } from "../../../../hooks/useFollowers";
import { followUser, unfollowUser } from "../../../../services/profileService";
import "./ProfileStats.css";

interface ProfileStatsProps {
    followers: string[];
    following: string[];
    strategies: Strategy[];
    onFollowAction: () => Promise<void>;
}

const ProfileStats = ({
    followers,
    following,
    strategies,
    onFollowAction
}: ProfileStatsProps) => {
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showStrategies, setShowStrategies] = useState(false);
    const { user: currentUser } = useAuth();

    const followersCount = followers.filter(id => id !== currentUser?.id).length;
    const followingCount = following.length;
    const strategiesCount = strategies.length;

    const { users: followerUsers, loading: loadingFollowers, refetch: refetchFollowers } = useFollowers(followers);
    const { users: followingUsers, loading: loadingFollowing, refetch: refetchFollowing } = useFollowers(following);

    return (
        <>
            <div className="profile-stats">
                <div 
                    className="profile-stats__item"
                    onClick={() => setShowFollowers(true)}
                >
                    <span className="profile-stats__value">{followersCount}</span>
                    <span className="profile-stats__label">followers</span>
                </div>
                <div 
                    className="profile-stats__item"
                    onClick={() => setShowFollowing(true)}
                >
                    <span className="profile-stats__value">{followingCount}</span>
                    <span className="profile-stats__label">following</span>
                </div>
                <div 
                    className="profile-stats__item"
                    onClick={() => setShowStrategies(true)}
                >
                    <span className="profile-stats__value">{strategiesCount}</span>
                    <span className="profile-stats__label">strategies</span>
                </div>
            </div>

            <FullscreenModal
                isOpen={showFollowers}
                onClose={() => {
                    setShowFollowers(false);
                    onFollowAction(); // Refetch profile data when modal closes
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
                    onFollowAction(); // Refetch profile data when modal closes
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
        </>
    );
};

export default ProfileStats;
