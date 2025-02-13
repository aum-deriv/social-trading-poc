import type Strategy from "./strategy.types";

interface User {
    id: string;
    username: string;
    email: string;
    displayName: string;
    profilePicture?: string;
    userType: "leader" | "copier";
    followers?: string[]; // Array of user IDs
    following?: string[]; // Array of user IDs
    accounts?: string[]; // Array of account IDs
    strategies?: Strategy[]; // Array of strategies
    performance?: {
        winRate: number;
        totalPnL: number;
        monthlyReturn: number;
        totalTrades: number;
    };
    createdAt?: string;
    updatedAt?: string;
    isFirstLogin?: boolean;
}

export default User;
