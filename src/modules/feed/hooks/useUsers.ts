import { useQueryDB } from "@hooks/db";
import type User from "@/types/user.types";

export const useUsers = () => {
    const { data, error, isLoading } = useQueryDB<User[]>("users");

    const usersMap =
        data?.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as { [key: string]: User }) ?? null;

    return { users: usersMap, error, isLoading };
};
