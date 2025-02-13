import { useNavigate } from "react-router-dom";
import type User from "@/types/user.types";
import Button from "@/components/input/Button";
import "./UserList.css";

interface UserListProps {
    users: User[];
    currentUserId?: string;
    onFollowUser?: (userId: string) => Promise<void>;
    onUnfollowUser?: (userId: string) => Promise<void>;
    listType?: 'followers' | 'following';
}

const UserList = ({ users, currentUserId, onFollowUser, onUnfollowUser, listType }: UserListProps) => {
    const navigate = useNavigate();

    const handleUserClick = (username: string) => {
        navigate(`/profile/${username}`);
    };

    const filteredUsers = users.filter(user => user.id !== currentUserId);

    return (
        <div className="user-list">
            {filteredUsers.length === 0 ? (
                <div className="user-list--empty">
                    {listType === 'followers' 
                        ? "No followers yet" 
                        : listType === 'following' 
                            ? "Not following anyone yet"
                            : "No users found"
                    }
                </div>
            ) : filteredUsers.map((user) => (
                <div key={user.id} className="user-list__item">
                    <div 
                        className="user-list__user-info"
                        onClick={() => handleUserClick(user.username)}
                    >
                        <img
                            src={user.profilePicture || "/default-avatar.png"}
                            alt={user.username}
                            className="user-list__avatar"
                        />
                        <div className="user-list__details">
                            <span className="user-list__username">{user.username}</span>
                            <span className="user-list__type">{user.userType}</span>
                        </div>
                    </div>
                    {currentUserId && currentUserId !== user.id && onFollowUser && onUnfollowUser && (
                        <Button
                            variant={user.followers?.includes(currentUserId) ? "secondary" : "primary"}
                            onClick={() => {
                                if (user.followers?.includes(currentUserId)) {
                                    onUnfollowUser(user.id);
                                } else {
                                    onFollowUser(user.id);
                                }
                            }}
                        >
                            {user.followers?.includes(currentUserId) 
                                ? "Unfollow" 
                                : listType === 'followers' ? "Follow Back" : "Follow"
                            }
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default UserList;
