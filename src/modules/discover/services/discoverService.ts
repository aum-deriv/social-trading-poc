import type User from '@/types/user.types';
import type { CopyRelationship } from '@/types/copy.types';
import type { Strategy, TradeType } from '@/types/strategy.types';

export interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

interface CurrencyAccount {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  tradingStrategies: string[];
  isActive: boolean;
}

const JSON_SERVER_URL = import.meta.env.VITE_JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
  throw new Error('VITE_JSON_SERVER_URL environment variable is not set');
}

export interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

export interface ExtendedStrategy extends Omit<Strategy, 'tradeType'> {
  tradeType: TradeType;
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  currency?: string;
  isFollowing?: boolean;
  isCopying?: boolean;
}

export const discoverService = {
  async fetchAllData(userId?: string) {
    try {
      const [usersRes, strategiesRes, currencyAccountsRes] = await Promise.all([
        fetch(`${JSON_SERVER_URL}/users`),
        fetch(`${JSON_SERVER_URL}/tradingStrategies`),
        fetch(`${JSON_SERVER_URL}/currencyAccounts`),
      ]);

      const [users, strategiesData, accounts]: [User[], Strategy[], CurrencyAccount[]] =
        await Promise.all([usersRes.json(), strategiesRes.json(), currencyAccountsRes.json()]);

      // Mock assets data since the endpoint doesn't exist
      const assetsData: Asset[] = [
        {
          symbol: 'BTC-USD',
          name: 'Bitcoin',
          imageUrl: 'https://images.unsplash.com/photo-1519162584292-56dfc9eb5db4?w=400',
          currentPrice: 62500.5,
          changePercentage: 2.75,
          direction: 'up',
        },
        {
          symbol: 'ETH-USD',
          name: 'Ethereum',
          imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400',
          currentPrice: 3050.25,
          changePercentage: -1.5,
          direction: 'down',
        },
        {
          symbol: 'EUR-USD',
          name: 'Euro/US Dollar',
          imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=400',
          currentPrice: 1.085,
          changePercentage: 0.3,
          direction: 'up',
        },
      ];

      // Get current user data to check following status
      const currentUserData = userId
        ? await fetch(`${JSON_SERVER_URL}/users/${userId}`).then(res => res.json())
        : null;

      // Process leaders
      const leaders = users
        .filter(u => u.userType === 'leader')
        .map(leader => ({
          id: leader.id,
          username: leader.username,
          avatar: leader.profilePicture,
          copiers: Math.floor(Math.random() * 2000) + 500,
          totalProfit: Math.floor(Math.random() * 900000) + 100000,
          winRate: Math.floor(Math.random() * 20) + 70,
          isFollowing: currentUserData ? currentUserData.following.includes(leader.id) : false,
        }));

      // Get copy relationships for current user
      const copyRelations = userId
        ? await fetch(`${JSON_SERVER_URL}/copyRelationships?copierId=${userId}`).then(res =>
            res.json()
          )
        : [];

      // Process strategies
      const processedStrategies = strategiesData.map(strategy => {
        const leader = users.find(u => u.id === strategy.leaderId);
        const account = accounts.find(a => a.id === strategy.accountId);
        const isCopying = copyRelations.some(
          (rel: CopyRelationship) => rel.strategyId === strategy.id
        );

        return {
          ...strategy,
          tradeType: 'multipliers', // Default trade type since it's required by the interface
          leader: leader
            ? {
                username: leader.username,
                displayName: leader.displayName,
                profilePicture: leader.profilePicture,
              }
            : undefined,
          currency: account?.currency,
          isFollowing: currentUserData
            ? currentUserData.following.includes(strategy.leaderId)
            : false,
          isCopying,
        };
      });

      return {
        leaders,
        strategies: processedStrategies,
        assets: assetsData,
      };
    } catch (error) {
      console.error('Error fetching discover data:', error);
      return {
        leaders: [],
        strategies: [],
        assets: [],
      };
    }
  },

  async toggleFollow(userId: string, leaderId: string) {
    try {
      // Get current leader and user data
      const [leaderRes, currentUserRes] = await Promise.all([
        fetch(`${JSON_SERVER_URL}/users/${leaderId}`),
        fetch(`${JSON_SERVER_URL}/users/${userId}`),
      ]);

      const leader = await leaderRes.json();
      const currentUser = await currentUserRes.json();

      // Update following/followers lists
      const isFollowing = currentUser.following.includes(leaderId);
      if (isFollowing) {
        leader.followers = leader.followers.filter((id: string) => id !== userId);
        currentUser.following = currentUser.following.filter((id: string) => id !== leaderId);
      } else {
        leader.followers.push(userId);
        currentUser.following.push(leaderId);
      }

      // Update both users in database
      await Promise.all([
        fetch(`${JSON_SERVER_URL}/users/${leaderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leader),
        }),
        fetch(`${JSON_SERVER_URL}/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentUser),
        }),
      ]);

      return !isFollowing;
    } catch (error) {
      console.error('Error updating follow status:', error);
      throw error;
    }
  },

  async toggleCopyStrategy(userId: string, strategyId: string) {
    try {
      // Get current strategy data
      const strategyRes = await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`);
      const strategy = await strategyRes.json();

      // Check if relationship already exists
      const relationshipId = `${userId}-${strategyId}`;
      const existingRes = await fetch(`${JSON_SERVER_URL}/copyRelationships?id=${relationshipId}`);
      const existing = await existingRes.json();

      if (existing.length > 0) {
        // Delete existing relationship
        await fetch(`${JSON_SERVER_URL}/copyRelationships/${relationshipId}`, {
          method: 'DELETE',
        });

        // Remove user from strategy copiers
        strategy.copiers = strategy.copiers.filter((id: string) => id !== userId);
        await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(strategy),
        });

        return false; // Not copying anymore
      } else {
        // Create new copy relationship
        const copyRelationship = {
          id: relationshipId,
          copierId: userId,
          leaderId: strategy.leaderId,
          strategyId: strategyId,
          copierAccountId: 'default', // You might want to let user select an account
          status: 'active',
          copySize: 1000, // Default copy size
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await fetch(`${JSON_SERVER_URL}/copyRelationships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copyRelationship),
        });

        // Add user to strategy copiers
        strategy.copiers.push(userId);
        await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(strategy),
        });

        return true; // Now copying
      }
    } catch (error) {
      console.error('Error copying strategy:', error);
      throw error;
    }
  },
};
