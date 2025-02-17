import type { default as Post, Comment } from "@/types/post.types";

interface CreatePostContent {
    text: string;
    images: string[];
}

interface CreatePostData {
    userId: string;
    content: CreatePostContent;
}

interface AddCommentData {
    userId: string;
    content: string;
}

interface AddReplyData extends AddCommentData {
    commentId: string;
}

export const createPost = async (data: CreatePostData) => {
    const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: data.userId,
                content: {
                    text: data.content.text,
                    images: data.content.images,
                },
                engagement: {
                    likes: [],
                    comments: [],
                    shares: 0,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create post");
    }

    return response.json();
};

export const addComment = async (postId: string, data: AddCommentData) => {
    // First get the current post
    const getResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`
    );
    if (!getResponse.ok) {
        throw new Error("Failed to fetch post");
    }
    const post = await getResponse.json();

    // Add the new comment to existing comments
    const updatedPost = {
        ...post,
        engagement: {
            ...post.engagement,
            comments: [
                ...post.engagement.comments,
                {
                    id: crypto.randomUUID(),
                    userId: data.userId,
                    content: data.content,
                    likes: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
    };

    // Update the post with new comments
    const updateResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPost),
        }
    );

    if (!updateResponse.ok) {
        throw new Error("Failed to add comment");
    }

    return updateResponse.json();
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

export const likeComment = async (
    postId: string,
    commentId: string,
    userId: string
) => {
    // First get the current post
    const getResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`
    );
    if (!getResponse.ok) {
        throw new Error("Failed to fetch post");
    }
    const post = await getResponse.json();

    // Update the comments with the new like
    const updatedComments = findAndUpdateComment(
        post.engagement.comments,
        commentId,
        userId
    );

    // Update the post with new comments
    const updatedPost = {
        ...post,
        engagement: {
            ...post.engagement,
            comments: updatedComments,
        },
    };

    const updateResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPost),
        }
    );

    if (!updateResponse.ok) {
        throw new Error("Failed to like comment");
    }

    return updateResponse.json();
};

export const addReply = async (postId: string, data: AddReplyData) => {
    // First get the current post
    const getResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`
    );
    if (!getResponse.ok) {
        throw new Error("Failed to fetch post");
    }
    const post = await getResponse.json();

    // Find the parent comment and add the reply
    const updatedComments = post.engagement.comments.map((comment: Comment) => {
        if (comment.id === data.commentId) {
            return {
                ...comment,
                replies: [
                    ...(comment.replies || []),
                    {
                        id: crypto.randomUUID(),
                        userId: data.userId,
                        content: data.content,
                        likes: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            };
        }
        return comment;
    });

    // Update the post with new comments
    const updatedPost = {
        ...post,
        engagement: {
            ...post.engagement,
            comments: updatedComments,
        },
    };

    const updateResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPost),
        }
    );

    if (!updateResponse.ok) {
        throw new Error("Failed to add reply");
    }

    return updateResponse.json();
};

export const getUserPosts = async (userId: string) => {
    const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts?userId=${userId}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch user posts");
    }
    return response.json();
};

export const getPosts = async (activeTab: string, userId: string) => {
    if (activeTab === "profile") {
        return getUserPosts(userId);
    } else if (activeTab === "For you") {
        const response = await fetch(
            `${import.meta.env.VITE_JSON_SERVER_URL}/posts`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }
        return response.json();
    } else {
        return getFollowingPosts(userId);
    }
};

export const getPost = async (postId: string) => {
    const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch post");
    }
    return response.json();
};

export const updatePost = async (postId: string, data: Post) => {
    const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update post");
    }

    return response.json();
};

export const likePost = async (postId: string, userId: string) => {
    const post = await getPost(postId);
    const isLiked = post.engagement.likes.includes(userId);

    const updatedPost = {
        ...post,
        engagement: {
            ...post.engagement,
            likes: isLiked
                ? post.engagement.likes.filter((id: string) => id !== userId)
                : [...post.engagement.likes, userId],
        },
    };

    return updatePost(postId, updatedPost);
};

export const sharePost = async (postId: string) => {
    const post = await getPost(postId);

    const updatedPost = {
        ...post,
        engagement: {
            ...post.engagement,
            shares: post.engagement.shares + 1,
        },
    };

    return updatePost(postId, updatedPost);
};

export const getFollowingPosts = async (userId: string) => {
    try {
        // Get current user to get following list
        const userResponse = await fetch(
            `${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`
        );
        if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
        }
        const user = await userResponse.json();

        // Get all posts
        const postsResponse = await fetch(
            `${import.meta.env.VITE_JSON_SERVER_URL}/posts`
        );
        if (!postsResponse.ok) {
            throw new Error("Failed to fetch posts");
        }
        const posts = await postsResponse.json();

        // Filter posts by users being followed
        return posts.filter((post: Post) =>
            user.following.includes(post.userId)
        );
    } catch {
        throw new Error("Failed to fetch following posts");
    }
};
