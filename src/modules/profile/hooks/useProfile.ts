import { useState, useEffect } from "react";
import type User from "@/types/user.types";
import type Post from "@/types/post.types";
import { getUserByUsername, getUserPosts, followUser, unfollowUser } from "../services/profileService";
import { useAuth } from "@/context/AuthContext";

interface UseProfileResult {
    profile: User | null;
    posts: Post[];
    isOwnProfile: boolean;
    isFollowing: boolean;
    loading: boolean;
    error: string | null;
    handleFollow: () => Promise<void>;
    handleUnfollow: () => Promise<void>;
    refetch: () => Promise<void>;
}

export const useProfile = (username: string): UseProfileResult => {
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isOwnProfile = profile?.id === currentUser?.id;
    const isFollowing = currentUser?.following?.includes(profile?.id || "") ?? false;

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await getUserByUsername(username);
            setProfile(profileData);

            const userPosts = await getUserPosts(profileData.id);
            setPosts(userPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setProfile(null);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    const handleFollow = async () => {
        if (!currentUser || !profile) return;
        try {
            setError(null);
            await followUser(currentUser.id, profile.id);
            await fetchProfile();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to follow user");
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser || !profile) return;
        try {
            setError(null);
            await unfollowUser(currentUser.id, profile.id);
            await fetchProfile();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to unfollow user");
        }
    };

    return {
        profile,
        posts,
        isOwnProfile,
        isFollowing,
        loading,
        error,
        handleFollow,
        handleUnfollow,
        refetch: fetchProfile
    };
};
