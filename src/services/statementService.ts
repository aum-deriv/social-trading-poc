import { getStoredAuth } from './authService';

export interface StatementItem {
  id: string;
  type: string;
  actionType: string;
  currency: string;
  amount: number;
  balanceAfter: number;
  referenceId: number;
  transactionTime: string;
  symbol: string;
  leaderDisplayName: string;
  strategyName: string;
  multiplier?: number;
  buyPrice?: number;
  payout?: number;
}

const BASE_URL = import.meta.env.VITE_JSON_SERVER_URL;

export const getStatements = async (): Promise<StatementItem[]> => {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${BASE_URL}/statements?userId=${auth.user.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch statements');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching statements:', error);
    throw error;
  }
};

export const getStatementsByType = async (type: string): Promise<StatementItem[]> => {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${BASE_URL}/statements?userId=${auth.user.id}&type=${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch statements by type');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching statements by type:', error);
    throw error;
  }
};
