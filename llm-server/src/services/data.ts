import { Post, User, TradingStrategy } from '../types';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
  throw new Error('JSON_SERVER_URL environment variable is not set');
}

export class DataService {
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getLeaders(): Promise<User[]> {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/users?userType=leader`);
      if (!response.ok) throw new Error('Failed to fetch leaders');
      const data = await response.json();
      return data as User[];
    } catch (error) {
      console.error('Error fetching leaders:', error);
      return [];
    }
  }

  async getUserPosts(): Promise<Post[]> {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data as Post[];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  private validateId(id: string, type: string): void {
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error(`Invalid ${type} ID format`);
    }
  }

  async getPost(postId: string): Promise<Post | null> {
    try {
      this.validateId(postId, 'post');
      const response = await fetch(`${JSON_SERVER_URL}/posts/${encodeURIComponent(postId)}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      return data as Post;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  async getStrategies(): Promise<TradingStrategy[]> {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/tradingStrategies`);
      if (!response.ok) throw new Error('Failed to fetch strategies');
      const data = await response.json();
      return data as TradingStrategy[];
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }
  }

  async getUserStrategies(accountId: string): Promise<TradingStrategy[]> {
    try {
      this.validateId(accountId, 'account');

      // First try to get strategies by accountId
      const accountResponse = await fetch(
        `${JSON_SERVER_URL}/tradingStrategies?accountId=${encodeURIComponent(accountId)}`
      );
      if (!accountResponse.ok) throw new Error('Failed to fetch strategies by accountId');
      const accountData = (await accountResponse.json()) as TradingStrategy[];

      // If we found strategies, return them
      if (accountData.length > 0) {
        return accountData;
      }

      // If no strategies found by accountId, try by leaderId
      const leaderResponse = await fetch(
        `${JSON_SERVER_URL}/tradingStrategies?leaderId=${encodeURIComponent(accountId)}`
      );
      if (!leaderResponse.ok) throw new Error('Failed to fetch strategies by leaderId');
      const leaderData = await leaderResponse.json();
      return leaderData as TradingStrategy[];
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      this.validateId(userId, 'user');
      const response = await fetch(`${JSON_SERVER_URL}/users/${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}
