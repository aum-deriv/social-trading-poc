import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CopyRelationship } from '../../types/copy.types';
import TabNavigation from '../../components/navigation/TabNavigation';
import Search from './components/Search';
import LeadersSection from './components/LeadersSection';
import StrategiesSection from './components/StrategiesSection';
import TrendingAssets from './components/TrendingAssets';
import './Discover.css';

interface TradingStrategy {
  id: string;
  leaderId: string;
  accountId: string;
  name: string;
  description: string;
  tradeType: string;
  riskLevel: string;
  copiers: string[];
  isActive: boolean;
}

interface CurrencyAccount {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  tradingStrategies: string[];
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  userType: string;
  following: string[];
  followers: string[];
}

interface Leader {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
}

interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

interface Strategy {
  id: string;
  leaderId: string;
  accountId: string;
  name: string;
  description: string;
  tradeType: string;
  copiers: string[];
  leader?: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  currency?: string;
  isFollowing?: boolean;
  isCopying?: boolean;
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);

  const JSON_SERVER_URL = import.meta.env.VITE_JSON_SERVER_URL;
  const LLM_SERVER_URL = import.meta.env.VITE_LLM_SERVER_URL;
  if (!JSON_SERVER_URL) {
    throw new Error('VITE_JSON_SERVER_URL environment variable is not set');
  }
  if (!LLM_SERVER_URL) {
    throw new Error('VITE_LLM_SERVER_URL environment variable is not set');
  }

  const { user } = useAuth();

  const tabs = isLeader ? ['Trending Assets'] : ['Leaders', 'Strategies', 'Trending Assets'];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCopyStrategy = useCallback(
    async (strategyId: string) => {
      if (!user) return;

      try {
        // Get current strategy data
        const strategyRes = await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`);
        const strategy = await strategyRes.json();

        // Check if relationship already exists
        const relationshipId = `${user.id}-${strategyId}`;
        const existingRes = await fetch(
          `${JSON_SERVER_URL}/copyRelationships?id=${relationshipId}`
        );
        const existing = await existingRes.json();

        if (existing.length > 0) {
          // Delete existing relationship
          await fetch(`${JSON_SERVER_URL}/copyRelationships/${relationshipId}`, {
            method: 'DELETE',
          });

          // Remove user from strategy copiers
          strategy.copiers = strategy.copiers.filter((id: string) => id !== user.id);
          await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(strategy),
          });

          // Update local state to show "Copy Strategy"
          setStrategies(prevStrategies =>
            prevStrategies.map(s => (s.id === strategyId ? { ...s, isCopying: false } : s))
          );
        } else {
          // Create new copy relationship
          const copyRelationship = {
            id: relationshipId,
            copierId: user.id,
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
          strategy.copiers.push(user.id);
          await fetch(`${JSON_SERVER_URL}/tradingStrategies/${strategyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(strategy),
          });

          // Update local state to show "Stop Copying"
          setStrategies(prevStrategies =>
            prevStrategies.map(s => (s.id === strategyId ? { ...s, isCopying: true } : s))
          );
        }
      } catch (error) {
        console.error('Error copying strategy:', error);
      }
    },
    [user]
  );

  const handleFollowToggle = useCallback(
    async (leaderId: string) => {
      if (!user) return;

      try {
        // Get current leader and user data
        const [leaderRes, currentUserRes] = await Promise.all([
          fetch(`${JSON_SERVER_URL}/users/${leaderId}`),
          fetch(`${JSON_SERVER_URL}/users/${user.id}`),
        ]);

        const leader = await leaderRes.json();
        const currentUser = await currentUserRes.json();

        // Update following/followers lists
        const isFollowing = currentUser.following.includes(leaderId);
        if (isFollowing) {
          // Unfollow: Remove from lists
          leader.followers = leader.followers.filter((id: string) => id !== user.id);
          currentUser.following = currentUser.following.filter((id: string) => id !== leaderId);
        } else {
          // Follow: Add to lists
          leader.followers.push(user.id);
          currentUser.following.push(leaderId);
        }

        // Update both users in database
        await Promise.all([
          fetch(`${JSON_SERVER_URL}/users/${leaderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leader),
          }),
          fetch(`${JSON_SERVER_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser),
          }),
        ]);

        // Update local state for both leaders and strategies
        setLeaders(prevLeaders =>
          prevLeaders.map(leader =>
            leader.id === leaderId ? { ...leader, isFollowing: !leader.isFollowing } : leader
          )
        );
        setStrategies(prevStrategies =>
          prevStrategies.map(strategy =>
            strategy.leaderId === leaderId
              ? { ...strategy, isFollowing: !strategy.isFollowing }
              : strategy
          )
        );
      } catch (error) {
        console.error('Error updating follow status:', error);
      }
    },
    [user]
  );

  useEffect(() => {
    // Set initial active tab based on user type
    setActiveTab(isLeader ? 'Trending Assets' : 'Leaders');
  }, [isLeader]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, strategiesRes, currencyAccountsRes] = await Promise.all([
          fetch(`${JSON_SERVER_URL}/users`),
          fetch(`${JSON_SERVER_URL}/tradingStrategies`),
          fetch(`${JSON_SERVER_URL}/currencyAccounts`),
        ]);

        const [users, strategiesData, accounts]: [User[], TradingStrategy[], CurrencyAccount[]] =
          await Promise.all([usersRes.json(), strategiesRes.json(), currencyAccountsRes.json()]);

        // Check if current user is a leader
        if (user) {
          const currentUser = users.find(u => u.id === user.id);
          setIsLeader(currentUser?.userType === 'leader');
        }

        // Get current user data to check following status
        const currentUserData = user
          ? await fetch(`${JSON_SERVER_URL}/users/${user.id}`).then(res => res.json())
          : null;

        // Process leaders
        const leaders = users
          .filter(u => u.userType === 'leader')
          .map(leader => ({
            id: leader.id,
            username: leader.username,
            profilePicture: leader.profilePicture,
            copiers: Math.floor(Math.random() * 2000) + 500,
            totalProfit: Math.floor(Math.random() * 900000) + 100000,
            winRate: Math.floor(Math.random() * 20) + 70,
            isFollowing: currentUserData ? currentUserData.following.includes(leader.id) : false,
          }));

        // Process strategies
        // Get copy relationships for current user
        const copyRelationsRes = await fetch(
          `${JSON_SERVER_URL}/copyRelationships?copierId=${user?.id}`
        );
        const copyRelations = await copyRelationsRes.json();

        const processedStrategies = strategiesData.map(strategy => {
          const leader = users.find(u => u.id === strategy.leaderId);
          const account = accounts.find(a => a.id === strategy.accountId);
          const isCopying = copyRelations.some(
            (rel: CopyRelationship) => rel.strategyId === strategy.id
          );
          return {
            ...strategy,
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

        setLeaders(leaders);
        setStrategies(processedStrategies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch trending assets separately
  useEffect(() => {
    const fetchTrendingAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${LLM_SERVER_URL}/api/market/trending-assets`);
        const data = await response.json();
        if (data.length > 0) {
          setAssets(data.slice(0, 5)); // Get only top 4 assets
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending assets:', error);
        setLoading(false);
      }
    };

    if (activeTab === 'Trending Assets') {
      fetchTrendingAssets();
    }
  }, [activeTab]);

  return (
    <div className="discover">
      <Search />
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === 'Leaders' ? (
        <LeadersSection loading={loading} leaders={leaders} onFollow={handleFollowToggle} />
      ) : activeTab === 'Strategies' ? (
        <StrategiesSection
          loading={loading}
          strategies={strategies}
          onFollow={handleFollowToggle}
          onCopy={handleCopyStrategy}
        />
      ) : (
        <TrendingAssets loading={loading} assets={assets} />
      )}
    </div>
  );
}
