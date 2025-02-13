import fs from "fs";
import path from "path";
import { Post, User, TradingStrategy } from "../types";

export class DataService {
    private data: any;

    constructor() {
        // Go up two levels from src/services to reach root
        const dbPath = path.join(__dirname, "../../..", "db.json");
        this.data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }

    getUser(userId: string): User | null {
        return this.data.users.find((u: User) => u.id === userId) || null;
    }

    getUserPosts(): Post[] {
        return this.data.posts;
    }

    getUserStrategies(userId: string): TradingStrategy[] {
        return this.data.tradingStrategies.filter((s: TradingStrategy) =>
            s.copiers.includes(userId)
        );
    }
}
