import { Post, User, TradingStrategy } from "../types";

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
    throw new Error('JSON_SERVER_URL environment variable is not set');
}

export class DataService {
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

    async getPost(postId: string): Promise<Post | null> {
        try {
            const response = await fetch(`${JSON_SERVER_URL}/posts/${postId}`);
            if (!response.ok) throw new Error('Failed to fetch post');
            const data = await response.json();
            return data as Post;
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    }

    async getUserStrategies(accountId: string): Promise<TradingStrategy[]> {
        try {
            // First try to get strategies by accountId
            const accountResponse = await fetch(`${JSON_SERVER_URL}/tradingStrategies?accountId=${accountId}`);
            if (!accountResponse.ok) throw new Error('Failed to fetch strategies by accountId');
            const accountData = await accountResponse.json() as TradingStrategy[];
            
            // If we found strategies, return them
            if (accountData.length > 0) {
                return accountData;
            }
            
            // If no strategies found by accountId, try by leaderId
            const leaderResponse = await fetch(`${JSON_SERVER_URL}/tradingStrategies?leaderId=${accountId}`);
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
            const response = await fetch(`${JSON_SERVER_URL}/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();
            return data as User;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }
}
