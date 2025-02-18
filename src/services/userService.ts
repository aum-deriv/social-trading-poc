const JSON_SERVER_URL = import.meta.env.VITE_JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
  throw new Error('VITE_JSON_SERVER_URL environment variable is not set');
}

export interface UserRelationship {
  isFollowing: boolean;
  followers: string[];
  following: string[];
}

export async function toggleUserFollow(
  targetUserId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    // Get both users' data
    const [targetUserRes, currentUserRes] = await Promise.all([
      fetch(`${JSON_SERVER_URL}/users/${targetUserId}`),
      fetch(`${JSON_SERVER_URL}/users/${currentUserId}`),
    ]);

    const targetUser = await targetUserRes.json();
    const currentUser = await currentUserRes.json();

    // Initialize arrays if they don't exist
    targetUser.followers = targetUser.followers || [];
    targetUser.following = targetUser.following || [];
    currentUser.followers = currentUser.followers || [];
    currentUser.following = currentUser.following || [];

    // Check current following status
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow: Remove from lists
      targetUser.followers = targetUser.followers.filter((id: string) => id !== currentUserId);
      currentUser.following = currentUser.following.filter((id: string) => id !== targetUserId);
    } else {
      // Follow: Add to lists
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
    }

    // Update both users in database
    await Promise.all([
      fetch(`${JSON_SERVER_URL}/users/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUser),
      }),
      fetch(`${JSON_SERVER_URL}/users/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      }),
    ]);

    // Return new following status
    return !isFollowing;
  } catch (error) {
    console.error('Error updating follow status:', error);
    throw error;
  }
}

export async function getUserRelationship(
  targetUserId: string,
  currentUserId: string
): Promise<UserRelationship> {
  try {
    const targetUserRes = await fetch(`${JSON_SERVER_URL}/users/${targetUserId}`);
    const targetUser = await targetUserRes.json();

    const currentUserRes = await fetch(`${JSON_SERVER_URL}/users/${currentUserId}`);
    const currentUser = await currentUserRes.json();

    return {
      isFollowing: currentUser.following?.includes(targetUserId) || false,
      followers: targetUser.followers || [],
      following: targetUser.following || [],
    };
  } catch (error) {
    console.error('Error getting user relationship:', error);
    throw error;
  }
}
