import { useMemo } from "react";
import { useQueryDB } from "@hooks/db";
import type Post from "@/types/post.types";
import type User from "@/types/user.types";

export const usePosts = (activeTab: string, userId: string) => {
    const { data: user } = useQueryDB<User>(`users/${userId}`);
    const { data: allPosts, error, isLoading } = useQueryDB<Post[]>("posts");

    const posts = useMemo(() => {
        if (!allPosts) return [];

        switch (activeTab) {
            case "profile":
                return allPosts.filter((post) => post.userId === userId);
            case "Following":
                return allPosts.filter(
                    (post) => user?.following?.includes(post.userId) ?? false
                );
            default: // "For you"
                return allPosts;
        }
    }, [allPosts, activeTab, userId, user]);

    return { posts, error, isLoading };
};
