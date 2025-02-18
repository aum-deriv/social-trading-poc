import type { StrategyFormData } from '../components/StrategyForm/StrategyForm';
import type Strategy from '@/types/strategy.types';

const BASE_URL = import.meta.env.VITE_JSON_SERVER_URL;

const findAccountByCurrency = async (userId: string, currency: string): Promise<string> => {
  const response = await fetch(
    `${BASE_URL}/currencyAccounts?userId=${userId}&currency=${currency}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }

  const accounts = await response.json();

  if (accounts.length === 0) {
    throw new Error(`No account found for currency ${currency}`);
  }

  return accounts[0].id;
};

export const createStrategy = async (userId: string, data: StrategyFormData): Promise<Strategy> => {
  // Find account with matching currency
  const accountId = await findAccountByCurrency(userId, data.currency);

  const response = await fetch(`${BASE_URL}/tradingStrategies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      leaderId: userId,
      accountId,
      name: data.name,
      description: data.description,
      tradeType: data.tradeType,
      riskLevel: data.riskLevel,
      copiers: [],
      winRate: 0,
      totalPnL: 0,
      minInvestment: 100,
      maxInvestment: 10000,
      tradingPairs: [],
      timeframe: '1D',
      performance: {
        totalReturn: 0,
        winRate: 0,
        averageProfit: 0,
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create strategy');
  }

  return response.json();
};

export const getStrategy = async (id: string): Promise<Strategy> => {
  const response = await fetch(`${BASE_URL}/tradingStrategies/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch strategy');
  }

  return response.json();
};

export const getStrategiesByLeader = async (leaderId: string): Promise<Strategy[]> => {
  const response = await fetch(`${BASE_URL}/tradingStrategies?leaderId=${leaderId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch strategies');
  }

  return response.json();
};

export const updateStrategy = async (id: string, data: Partial<Strategy>): Promise<Strategy> => {
  const response = await fetch(`${BASE_URL}/tradingStrategies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update strategy');
  }

  return response.json();
};
