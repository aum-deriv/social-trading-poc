import "./ProfileBasicInfo.css";

interface ProfileBasicInfoProps {
    username: string;
    displayName?: string;
    profilePicture?: string;
}

const ProfileBasicInfo = ({
    username,
    displayName,
    profilePicture
}: ProfileBasicInfoProps) => {
    const formattedDisplayName = displayName?.split('|')[0].trim() || username;

    return (
        <div className="profile-basic-info">
            <img
                src={profilePicture || "/default-avatar.png"}
                alt={username}
                className="profile-basic-info__avatar"
            />
            <div className="profile-basic-info__content">
                <h1 className="profile-basic-info__display-name">
                    {formattedDisplayName}
                </h1>
                <span className="profile-basic-info__username">@{username}</span>
            </div>
        </div>
    );
};

export default ProfileBasicInfo;
