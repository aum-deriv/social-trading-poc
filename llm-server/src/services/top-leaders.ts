import fetch from 'node-fetch';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;
if (!JSON_SERVER_URL) {
  throw new Error('JSON_SERVER_URL environment variable is not set');
}

interface User {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  userType: string;
  performance?: {
    winRate: number;
  };
}

interface Strategy {
  id: string;
  leaderId: string;
  copiers: string[];
}

interface Leader {
  id: string;
  username: string;
  profilePicture?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
}

export async function getTopLeaders(): Promise<Leader[]> {
  try {
    // Get all users and strategies
    const [usersRes, strategiesRes] = await Promise.all([
      fetch(`${JSON_SERVER_URL}/users`),
      fetch(`${JSON_SERVER_URL}/tradingStrategies`),
    ]);

    const [users, strategies] = await Promise.all([
      usersRes.json() as Promise<User[]>,
      strategiesRes.json() as Promise<Strategy[]>,
    ]);

    const leaders = users.filter(user => user.userType === 'leader');

    // Process each leader
    const processedLeaders = leaders.map(leader => {
      // Get all strategies for this leader
      const leaderStrategies = strategies.filter(strategy => strategy.leaderId === leader.id);

      // Get unique copiers across all strategies
      const uniqueCopiers = new Set<string>();
      leaderStrategies.forEach(strategy => {
        strategy.copiers.forEach(copierId => uniqueCopiers.add(copierId));
      });

      // Calculate total profit (random for now, as it's not in the data)
      const totalProfit = Math.floor(Math.random() * 900000) + 100000;

      return {
        id: leader.id,
        username: leader.username,
        profilePicture: leader.profilePicture,
        copiers: uniqueCopiers.size,
        totalProfit,
        winRate: leader.performance?.winRate || Math.floor(Math.random() * 20) + 70,
      };
    });

    // Sort by copiers count (primary) and win rate (secondary)
    const sortedLeaders = processedLeaders.sort((a, b) => {
      if (b.copiers !== a.copiers) {
        return b.copiers - a.copiers;
      }
      return b.winRate - a.winRate;
    });

    // Return top 3
    return sortedLeaders.slice(0, 3);
  } catch (error) {
    console.error('Error fetching top leaders:', error);
    throw error;
  }
}
