import { useParams } from 'react-router-dom';
import { useProfile } from '@/modules/profile/hooks/useProfile';
import ProfileHeader from '../../modules/profile/components/ProfileHeader';
import FeedList from '@/modules/feed/components/FeedList';
import AILoader from '@/components/AILoader';
import ErrorState from '@/components/feedback/ErrorState';
import './Profile.css';

const Profile = () => {
  const { username = '' } = useParams();
  const {
    profile,
    isOwnProfile,
    isFollowing,
    loading,
    error,
    handleFollow,
    handleUnfollow,
    handleProfileUpdate,
    refetch,
  } = useProfile(username);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <AILoader size={40} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <ErrorState message={error || 'Failed to load profile'} onRetry={refetch} />
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
        onProfileUpdate={handleProfileUpdate}
      />
      <div className="profile-page__content">
        <div className="profile-page__feed">
          <FeedList currentUserId={profile.id} currentUser={profile} activeTab="profile" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
