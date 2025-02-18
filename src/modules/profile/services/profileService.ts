import type User from '@/types/user.types';
import type { Strategy } from '@/types/strategy.types';
import type { CopyRelationship } from '@/types/copy.types';

const BASE_URL = import.meta.env.VITE_JSON_SERVER_URL;

const fetchUserStrategies = async (userId: string, userType: string): Promise<Strategy[]> => {
  // Fetch all strategies
  const strategiesResponse = await fetch(`${BASE_URL}/tradingStrategies`);
  if (!strategiesResponse.ok) {
    throw new Error('Failed to fetch strategies');
  }
  const allStrategies = await strategiesResponse.json();

  // For leaders, return created strategies
  if (userType === 'leader') {
    return allStrategies.filter((s: Strategy) => s.leaderId === userId);
  }

  // For copiers, fetch and filter by copy relationships
  const copyRelationsResponse = await fetch(`${BASE_URL}/copyRelationships?copierId=${userId}`);
  if (!copyRelationsResponse.ok) {
    throw new Error('Failed to fetch copy relationships');
  }
  const copyRelations = await copyRelationsResponse.json();

  return allStrategies.filter((s: Strategy) =>
    copyRelations.some((cr: CopyRelationship) => cr.strategyId === s.id && cr.status === 'active')
  );
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users?username=${encodeURIComponent(username)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  const users = await response.json();
  if (users.length === 0) {
    throw new Error('User not found');
  }
  const user = users[0];

  // Fetch user's strategies based on their type
  user.strategies = await fetchUserStrategies(user.id, user.userType);
  return user;
};

export const followUser = async (userId: string, targetUserId: string): Promise<User> => {
  // First get both users
  const [userResponse, targetUserResponse] = await Promise.all([
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`),
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${targetUserId}`),
  ]);

  if (!userResponse.ok || !targetUserResponse.ok) {
    throw new Error('Failed to fetch users');
  }

  const [user, targetUser] = await Promise.all([userResponse.json(), targetUserResponse.json()]);

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
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    }),
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${targetUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(targetUser),
    }),
  ]);

  if (!updateUserResponse.ok || !updateTargetResponse.ok) {
    throw new Error('Failed to update users');
  }

  return updateUserResponse.json();
};

export const unfollowUser = async (userId: string, targetUserId: string): Promise<User> => {
  // First get both users
  const [userResponse, targetUserResponse] = await Promise.all([
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`),
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${targetUserId}`),
  ]);

  if (!userResponse.ok || !targetUserResponse.ok) {
    throw new Error('Failed to fetch users');
  }

  const [user, targetUser] = await Promise.all([userResponse.json(), targetUserResponse.json()]);

  // Remove from following list for current user
  user.following = user.following.filter((id: string) => id !== targetUserId);

  // Remove from followers list for target user
  targetUser.followers = targetUser.followers.filter((id: string) => id !== userId);

  // Update both users
  const [updateUserResponse, updateTargetResponse] = await Promise.all([
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    }),
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${targetUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(targetUser),
    }),
  ]);

  if (!updateUserResponse.ok || !updateTargetResponse.ok) {
    throw new Error('Failed to update users');
  }

  return updateUserResponse.json();
};

export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (userIds.length === 0) return [];

  const promises = userIds.map(id =>
    fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${id}`).then(res =>
      res.ok ? res.json() : null
    )
  );

  const users = await Promise.all(promises);
  return users.filter((user): user is User => user !== null);
};

export const getUserPosts = async (userId: string) => {
  const response = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user posts');
  }
  return response.json();
};
