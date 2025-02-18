import { useState } from 'react';
import type Strategy from '@/types/strategy.types';
import { useAuth } from '@/context/AuthContext';
import FullscreenModal from '@/components/modal/FullscreenModal/FullscreenModal';
import AILoader from '@/components/AILoader';
import UserList from '../../../UserList/UserList';
import StrategyList from '../../../StrategyList/StrategyList';
import { useFollowers } from '../../../../hooks/useFollowers';
import { followUser, unfollowUser } from '../../../../services/profileService';
import './ProfileStats.css';

interface ProfileStatsProps {
  followers: string[];
  following: string[];
  strategies: Strategy[];
  onFollowAction: () => Promise<void>;
}

const ProfileStats = ({ followers, following, strategies, onFollowAction }: ProfileStatsProps) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);
  const { user: currentUser } = useAuth();

  const followersCount = followers.filter(id => id !== currentUser?.id).length;
  const followingCount = following.length;
  const strategiesCount = strategies.length;

  const {
    users: followerUsers,
    loading: loadingFollowers,
    refetch: refetchFollowers,
  } = useFollowers(followers);
  const {
    users: followingUsers,
    loading: loadingFollowing,
    refetch: refetchFollowing,
  } = useFollowers(following);

  const handleCopyStrategy = async (strategyId: string, isCopying: boolean) => {
    if (!currentUser?.id) return;

    try {
      if (isCopying) {
        // Stop copying
        const response = await fetch(
          `${import.meta.env.VITE_JSON_SERVER_URL}/copyRelationships?copierId=${currentUser.id}&strategyId=${strategyId}`
        );
        if (!response.ok) return;
        const relations = await response.json();

        // Delete the copy relationship
        if (relations.length > 0) {
          await fetch(
            `${import.meta.env.VITE_JSON_SERVER_URL}/copyRelationships/${relations[0].id}`,
            { method: 'DELETE' }
          );
        }
      } else {
        // Start copying
        await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/copyRelationships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            copierId: currentUser.id,
            strategyId,
            status: 'active',
            copySize: 1000, // Default copy size
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }

      // Refetch profile data to update strategies
      await onFollowAction();
    } catch (error) {
      console.error('Error handling strategy copy:', error);
    }
  };

  return (
    <>
      <div className="profile-stats">
        <div className="profile-stats__item" onClick={() => setShowFollowers(true)}>
          <span className="profile-stats__value">{followersCount}</span>
          <span className="profile-stats__label">followers</span>
        </div>
        <div className="profile-stats__item" onClick={() => setShowFollowing(true)}>
          <span className="profile-stats__value">{followingCount}</span>
          <span className="profile-stats__label">following</span>
        </div>
        <div className="profile-stats__item" onClick={() => setShowStrategies(true)}>
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
          <div className="user-list--loading">
            <AILoader size={40} showText={false} />
          </div>
        ) : (
          <UserList
            users={followerUsers}
            currentUserId={currentUser?.id}
            onFollowUser={async userId => {
              if (currentUser?.id) {
                await followUser(currentUser.id, userId);
                await refetchFollowers();
              }
            }}
            onUnfollowUser={async userId => {
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
          <div className="user-list--loading">
            <AILoader size={40} showText={false} />
          </div>
        ) : (
          <UserList
            users={followingUsers}
            currentUserId={currentUser?.id}
            onFollowUser={async userId => {
              if (currentUser?.id) {
                await followUser(currentUser.id, userId);
                await refetchFollowing();
              }
            }}
            onUnfollowUser={async userId => {
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
          isOwnProfile={
            currentUser?.userType === 'leader' &&
            strategies.some(s => s.leaderId === currentUser.id)
          }
          onCopyStrategy={handleCopyStrategy}
        />
      </FullscreenModal>
    </>
  );
};

export default ProfileStats;
