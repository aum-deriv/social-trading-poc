import { useState, useEffect } from "react";
import type User from "@/types/user.types";

export const useUser = (userId: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3001/users/${userId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user: ${response.statusText}`);
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to fetch user"));
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    return { user, loading, error };
};
