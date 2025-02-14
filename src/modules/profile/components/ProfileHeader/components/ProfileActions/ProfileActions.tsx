import Button from "@/components/input/Button";
import "./ProfileActions.css";

interface ProfileActionsProps {
    isOwnProfile: boolean;
    isFollowing: boolean;
    userType: string;
    onFollow: () => Promise<void>;
    onUnfollow: () => Promise<void>;
}

const ProfileActions = ({
    isOwnProfile,
    isFollowing,
    userType,
    onFollow,
    onUnfollow
}: ProfileActionsProps) => {
    return (
        <div className="profile-actions">
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
    );
};

export default ProfileActions;
