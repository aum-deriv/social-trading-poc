import { useState } from 'react';
import Button from '@/components/input/Button';
import { upgradeToLeader } from '@/services/userService';
import UpgradeModal from '@/components/modals/UpgradeModal/UpgradeModal';
import './ProfileActions.css';
import User from '@/types/user.types';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  userType: string;
  userId: string;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onUpgrade?: (updatedUser: User) => void;
}

const ProfileActions = ({
  isOwnProfile,
  isFollowing,
  userType,
  userId,
  onFollow,
  onUnfollow,
  onUpgrade,
}: ProfileActionsProps) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    try {
      const updatedUser = await upgradeToLeader(userId);
      if (onUpgrade) {
        onUpgrade(updatedUser);
      }
      setIsUpgradeModalOpen(false);
    } catch (error) {
      console.error('Error upgrading to leader:', error);
      // Here you might want to show an error notification to the user
    }
  };

  return (
    <div className="profile-actions">
      {!isOwnProfile && (
        <Button
          onClick={isFollowing ? onUnfollow : onFollow}
          variant={isFollowing ? 'secondary' : 'primary'}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
      {isOwnProfile && userType === 'copier' && (
        <>
          <Button variant="secondary" onClick={handleUpgradeClick}>
            Upgrade to Leader
          </Button>
          <UpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
            onConfirm={handleUpgradeConfirm}
          />
        </>
      )}
    </div>
  );
};

export default ProfileActions;
