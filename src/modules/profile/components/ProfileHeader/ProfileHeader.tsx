import type User from '@/types/user.types';
import ProfileBasicInfo from './components/ProfileBasicInfo';
import ProfileStats from './components/ProfileStats';
import ProfilePerformance from './components/ProfilePerformance';
import ProfileTradingPreferences from './components/ProfileTradingPreferences';
import './ProfileHeader.css';
import { UserType } from '@/types/user';

interface ProfileHeaderProps {
  profile: User;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onProfileUpdate?: (updatedProfile: User) => void;
}

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow,
  onProfileUpdate,
}: ProfileHeaderProps) => {
  const { id, username, profilePicture, userType, displayName, tradingPreferences } = profile;

  const handleUpgrade = (updatedUser: User) => {
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser);
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-header__info">
        <ProfileBasicInfo
          username={username}
          displayName={displayName}
          profilePicture={profilePicture}
          userType={userType}
          userId={id}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          onUpgrade={handleUpgrade}
        />
        <ProfileStats
          followers={profile.followers || []}
          following={profile.following || []}
          strategies={profile.strategies || []}
          onFollowAction={onFollow}
          profileId={profile.id}
        />
        {userType === UserType.LEADER && profile.performance && (
          <ProfilePerformance performance={profile.performance} />
        )}
        {tradingPreferences && (
          <ProfileTradingPreferences
            preferences={tradingPreferences}
            isOwnProfile={isOwnProfile}
            onUpdate={newPreferences => {
              if (onProfileUpdate) {
                onProfileUpdate({
                  ...profile,
                  tradingPreferences: newPreferences,
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
