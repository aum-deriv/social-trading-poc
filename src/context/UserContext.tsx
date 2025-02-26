import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type User from '@/types/user.types';
import { useAuth } from './AuthContext';

interface UserState {
  usersMap: Record<string, User>;
  loadingUsers: Record<string, boolean>;
  errors: Record<string, string | null>;
}

interface UserContextType {
  users: Record<string, User>;
  loadingUsers: Record<string, boolean>;
  errors: Record<string, string | null>;
  getUser: (userId: string) => Promise<User | null>;
  getUserById: (userId: string) => User | null;
  clearUserCache: () => void;
  refreshUser: (userId: string) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | null>(null);

// In-flight requests cache to prevent duplicate API calls
const requestCache: Record<string, Promise<User>> = {};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();
  const [state, setState] = useState<UserState>({
    usersMap: {},
    loadingUsers: {},
    errors: {},
  });

  // Initialize with authenticated user if available
  useEffect(() => {
    if (authUser) {
      setState(prev => ({
        ...prev,
        usersMap: {
          ...prev.usersMap,
          [authUser.id]: authUser,
        },
      }));
    }
  }, [authUser]);

  const getUser = useCallback(
    async (userId: string): Promise<User | null> => {
      // Return from cache if available
      if (state.usersMap[userId]) {
        return state.usersMap[userId];
      }

      // Set loading state
      setState(prev => ({
        ...prev,
        loadingUsers: { ...prev.loadingUsers, [userId]: true },
        errors: { ...prev.errors, [userId]: null },
      }));

      try {
        // Use request cache to deduplicate in-flight requests
        if (!requestCache[userId]) {
          requestCache[userId] = fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch user with ID ${userId}`);
              }
              return response.json();
            })
            .finally(() => {
              // Clear cache after a delay
              setTimeout(() => {
                delete requestCache[userId];
              }, 10000); // Cache for 10 seconds
            });
        }

        const userData = await requestCache[userId];

        // Update state with fetched user
        setState(prev => ({
          ...prev,
          usersMap: { ...prev.usersMap, [userId]: userData },
          loadingUsers: { ...prev.loadingUsers, [userId]: false },
        }));

        return userData;
      } catch (error) {
        setState(prev => ({
          ...prev,
          loadingUsers: { ...prev.loadingUsers, [userId]: false },
          errors: {
            ...prev.errors,
            [userId]: error instanceof Error ? error.message : 'Failed to fetch user',
          },
        }));
        return null;
      }
    },
    [state.usersMap]
  );

  const getUserById = useCallback(
    (userId: string): User | null => {
      return state.usersMap[userId] || null;
    },
    [state.usersMap]
  );

  const clearUserCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      usersMap: authUser ? { [authUser.id]: authUser } : {},
    }));
  }, [authUser]);

  const refreshUser = useCallback(async (userId: string): Promise<User | null> => {
    // Clear this user from cache
    delete requestCache[userId];

    try {
      const response = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user with ID ${userId}`);
      }

      const userData = await response.json();

      setState(prev => ({
        ...prev,
        usersMap: { ...prev.usersMap, [userId]: userData },
      }));

      return userData;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [userId]: error instanceof Error ? error.message : 'Failed to refresh user',
        },
      }));
      return null;
    }
  }, []);

  const value = {
    users: state.usersMap,
    loadingUsers: state.loadingUsers,
    errors: state.errors,
    getUser,
    getUserById,
    clearUserCache,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
