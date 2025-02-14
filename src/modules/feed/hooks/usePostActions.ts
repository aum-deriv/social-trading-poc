import { useQueryDB, useMutateDB } from "@hooks/db";
import type Post from "@/types/post.types";
import type { Comment } from "@/types/post.types";

export const useCreatePost = () => {
    return useMutateDB<Post>("posts");
};

export const useUpdatePost = (postId: string) => {
    return useMutateDB<Post>(`posts/${postId}`);
};

export const useAddComment = (postId: string) => {
    const { data: post } = useQueryDB<Post>(`posts/${postId}`);
    const { mutate } = useUpdatePost(postId);

    const addComment = async (userId: string, content: string) => {
        if (!post) return;

        const updatedPost = {
            ...post,
            engagement: {
                ...post.engagement,
                comments: [
                    ...post.engagement.comments,
                    {
                        id: crypto.randomUUID(),
                        userId,
                        content,
                        likes: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            },
        };

        return mutate(updatedPost);
    };

    return { addComment };
};

const findAndUpdateComment = (
    comments: Comment[],
    commentId: string,
    userId: string
): Comment[] => {
    return comments.map((comment) => {
        if (comment.id === commentId) {
            // Toggle like for this comment
            const likes = comment.likes.includes(userId)
                ? comment.likes.filter((id) => id !== userId)
                : [...comment.likes, userId];
            return { ...comment, likes };
        }
        // Check replies if they exist
        if (comment.replies) {
            return {
                ...comment,
                replies: findAndUpdateComment(
                    comment.replies,
                    commentId,
                    userId
                ),
            };
        }
        return comment;
    });
};

export const useLikeComment = (postId: string) => {
    const { data: post } = useQueryDB<Post>(`posts/${postId}`);
    const { mutate } = useUpdatePost(postId);

    const likeComment = async (commentId: string, userId: string) => {
        if (!post) return;

        const updatedComments = findAndUpdateComment(
            post.engagement.comments,
            commentId,
            userId
        );

        const updatedPost = {
            ...post,
            engagement: {
                ...post.engagement,
                comments: updatedComments,
            },
        };

        return mutate(updatedPost);
    };

    return { likeComment };
};

export const useAddReply = (postId: string) => {
    const { data: post } = useQueryDB<Post>(`posts/${postId}`);
    const { mutate } = useUpdatePost(postId);

    const addReply = async (
        commentId: string,
        userId: string,
        content: string
    ) => {
        if (!post) return;

        const updatedComments = post.engagement.comments.map((comment) => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: [
                        ...(comment.replies || []),
                        {
                            id: crypto.randomUUID(),
                            userId,
                            content,
                            likes: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    ],
                };
            }
            return comment;
        });

        const updatedPost = {
            ...post,
            engagement: {
                ...post.engagement,
                comments: updatedComments,
            },
        };

        return mutate(updatedPost);
    };

    return { addReply };
};
