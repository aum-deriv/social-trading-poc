import { useState, useEffect } from "react";
import type User from "@/types/user.types";
import { getUsersByIds } from "@/modules/profile/services/profileService";

export const useFollowers = (userIds: string[] = []) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedUsers = await getUsersByIds(userIds);
            setUsers(fetchedUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userIds.length > 0) {
            fetchUsers();
        } else {
            setUsers([]);
            setLoading(false);
        }
    }, [userIds]);

    // Expose refetch function
    return { users, loading, error, refetch: fetchUsers };
};
