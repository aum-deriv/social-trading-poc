import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CopyRelationship } from '../../types/copy.types';
import TabNavigation from '../../components/navigation/TabNavigation';
import Search from './components/Search';
import LeadersSection from './components/LeadersSection';
import StrategiesSection from './components/StrategiesSection';
import TrendingAssets from './components/TrendingAssets';
import './Discover.css';

import type { Strategy, ExtendedStrategy } from '@/types/strategy.types';

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

interface Asset {
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  changePercentage: number;
  direction: 'up' | 'down';
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [strategies, setStrategies] = useState<ExtendedStrategy[]>([]);
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

        const [users, strategiesData, accounts]: [User[], Strategy[], CurrencyAccount[]] =
          await Promise.all([usersRes.json(), strategiesRes.json(), currencyAccountsRes.json()]);

        // Check if current user is a leader
        if (user) {
          const currentUser = users.find(u => u.id === user.id);
          setIsLeader(currentUser?.userType === 'leader');
        }

        // Get copy relationships for current user
        const copyRelationsRes = await fetch(
          `${JSON_SERVER_URL}/copyRelationships?copierId=${user?.id}`
        );
        const copyRelations = await copyRelationsRes.json();

        const processedStrategies: ExtendedStrategy[] = strategiesData.map(strategy => {
          const leader = users.find(u => u.id === strategy.leaderId);
          const account = accounts.find(a => a.id === strategy.accountId);
          const isCopying = copyRelations.some(
            (rel: CopyRelationship) => rel.strategyId === strategy.id
          );
          return {
            ...strategy,
            performance: {
              totalReturn: Math.floor(Math.random() * 200) - 100, // -100 to +100
              winRate: Math.floor(Math.random() * 40) + 60, // 60 to 100
              averageProfit: Math.floor(Math.random() * 20) + 10, // 10 to 30
            },
            leader: leader
              ? {
                  username: leader.username,
                  displayName: leader.displayName,
                  profilePicture: leader.profilePicture,
                }
              : undefined,
            currency: account?.currency,
            isCopying,
          };
        });

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
        <LeadersSection />
      ) : activeTab === 'Strategies' ? (
        <StrategiesSection loading={loading} strategies={strategies} onCopy={handleCopyStrategy} />
      ) : (
        <TrendingAssets loading={loading} assets={assets} />
      )}
    </div>
  );
}
