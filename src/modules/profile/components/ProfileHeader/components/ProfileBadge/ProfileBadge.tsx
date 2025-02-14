import "./ProfileBadge.css";

interface ProfileBadgeProps {
    userType: string;
}

const ProfileBadge = ({ userType }: ProfileBadgeProps) => {
    return (
        <div className="profile-badge">
            <span className={`profile-badge__type profile-badge__type--${userType}`}>
                {userType}
            </span>
        </div>
    );
};

export default ProfileBadge;
