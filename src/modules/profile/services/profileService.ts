import type User from "@/types/user.types";

export const getUserByUsername = async (username: string): Promise<User> => {
    const response = await fetch(`http://localhost:3001/users?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }
    const users = await response.json();
    if (users.length === 0) {
        throw new Error("User not found");
    }
    return users[0];
};

export const followUser = async (userId: string, targetUserId: string): Promise<User> => {
    // First get both users
    const [userResponse, targetUserResponse] = await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`),
        fetch(`http://localhost:3001/users/${targetUserId}`)
    ]);

    if (!userResponse.ok || !targetUserResponse.ok) {
        throw new Error("Failed to fetch users");
    }

    const [user, targetUser] = await Promise.all([
        userResponse.json(),
        targetUserResponse.json()
    ]);

    // Update following list for current user
    if (!user.following.includes(targetUserId)) {
        user.following.push(targetUserId);
    }

    // Update followers list for target user
    if (!targetUser.followers.includes(userId)) {
        targetUser.followers.push(userId);
    }

    // Update both users
    const [updateUserResponse, updateTargetResponse] = await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        }),
        fetch(`http://localhost:3001/users/${targetUserId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(targetUser)
        })
    ]);

    if (!updateUserResponse.ok || !updateTargetResponse.ok) {
        throw new Error("Failed to update users");
    }

    return updateUserResponse.json();
};

export const unfollowUser = async (userId: string, targetUserId: string): Promise<User> => {
    // First get both users
    const [userResponse, targetUserResponse] = await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`),
        fetch(`http://localhost:3001/users/${targetUserId}`)
    ]);

    if (!userResponse.ok || !targetUserResponse.ok) {
        throw new Error("Failed to fetch users");
    }

    const [user, targetUser] = await Promise.all([
        userResponse.json(),
        targetUserResponse.json()
    ]);

    // Remove from following list for current user
    user.following = user.following.filter((id: string) => id !== targetUserId);

    // Remove from followers list for target user
    targetUser.followers = targetUser.followers.filter((id: string) => id !== userId);

    // Update both users
    const [updateUserResponse, updateTargetResponse] = await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        }),
        fetch(`http://localhost:3001/users/${targetUserId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(targetUser)
        })
    ]);

    if (!updateUserResponse.ok || !updateTargetResponse.ok) {
        throw new Error("Failed to update users");
    }

    return updateUserResponse.json();
};

export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
    if (userIds.length === 0) return [];
    
    const promises = userIds.map(id => 
        fetch(`http://localhost:3001/users/${id}`)
            .then(res => res.ok ? res.json() : null)
    );

    const users = await Promise.all(promises);
    return users.filter((user): user is User => user !== null);
};

export const getUserPosts = async (userId: string) => {
    const response = await fetch(`http://localhost:3001/posts?userId=${userId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch user posts");
    }
    return response.json();
};
