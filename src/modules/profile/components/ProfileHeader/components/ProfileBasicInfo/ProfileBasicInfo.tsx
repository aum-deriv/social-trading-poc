import './ProfileBasicInfo.css';
import ProfileBadge from '../ProfileBadge';
import ProfileActions from '../ProfileActions';
import User from '@/types/user.types';

interface ProfileBasicInfoProps {
  username: string;
  displayName?: string;
  profilePicture?: string;
  userType: string;
  userId: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onUpgrade?: (updatedUser: User) => void;
}

const ProfileBasicInfo = ({
  username,
  displayName,
  profilePicture,
  userType,
  userId,
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow,
  onUpgrade,
}: ProfileBasicInfoProps) => {
  const formattedDisplayName = displayName?.split('|')[0].trim() || username;

  return (
    <div className="profile-basic-info">
      <img
        src={profilePicture || '/default-avatar.png'}
        alt={username}
        className="profile-basic-info__avatar"
      />
      <div className="profile-basic-info__content">
        <div className="profile-basic-info__name-container">
          <h1 className="profile-basic-info__display-name">{formattedDisplayName}</h1>
          <ProfileBadge userType={userType} />
        </div>
        <span className="profile-basic-info__username">@{username}</span>
        <ProfileActions
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          onUpgrade={onUpgrade}
          userType={userType}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default ProfileBasicInfo;
