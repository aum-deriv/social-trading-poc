import type { default as Post, Comment } from '@/types/post.types';
import { detectLanguage } from '@/services/languageService';

interface CreatePostContent {
  text: string;
  images?: string[];
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
  const timestamp = new Date().toISOString();
  // Detect language using backend service
  const language = await detectLanguage(data.content.text);

  // Create the post
  const createResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
      language,
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
  });

  if (!createResponse.ok) {
    throw new Error('Failed to create post');
  }

  const createdPost = await createResponse.json();

  // Fetch the post again with expanded user data
  const fetchExpandedResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${createdPost.id}?_expand=user`
  );
  if (!fetchExpandedResponse.ok) {
    throw new Error('Failed to fetch created post');
  }

  return fetchExpandedResponse.json();
};

export const addComment = async (postId: string, data: AddCommentData) => {
  // First get the current post
  const fetchPostResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchPostResponse.ok) {
    throw new Error('Failed to fetch post');
  }
  const post = await fetchPostResponse.json();

  // Get the user data for the new comment
  const userResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${data.userId}`);
  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data');
  }
  const user = await userResponse.json();

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
          user: user,
        },
      ],
    },
  };

  // Update the post with new comments
  const updateResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPost),
  });

  if (!updateResponse.ok) {
    throw new Error('Failed to add comment');
  }

  // Fetch the updated post with expanded user data
  const fetchUpdatedResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchUpdatedResponse.ok) {
    throw new Error('Failed to fetch updated post');
  }

  return fetchUpdatedResponse.json();
};

const findAndUpdateComment = (
  comments: Comment[],
  commentId: string,
  userId: string
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === commentId) {
      // Toggle like for this comment
      const likes = comment.likes.includes(userId)
        ? comment.likes.filter(id => id !== userId)
        : [...comment.likes, userId];
      return { ...comment, likes };
    }
    // Check replies if they exist
    if (comment.replies) {
      return {
        ...comment,
        replies: findAndUpdateComment(comment.replies, commentId, userId),
      };
    }
    return comment;
  });
};

export const likeComment = async (postId: string, commentId: string, userId: string) => {
  // First get the current post
  const fetchPostResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchPostResponse.ok) {
    throw new Error('Failed to fetch post');
  }
  const post = await fetchPostResponse.json();

  // Update the comments with the new like
  const updatedComments = findAndUpdateComment(post.engagement.comments, commentId, userId);

  // Update the post with new comments
  const updatedPost = {
    ...post,
    engagement: {
      ...post.engagement,
      comments: updatedComments,
    },
  };

  const updateResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPost),
  });

  if (!updateResponse.ok) {
    throw new Error('Failed to like comment');
  }

  // Fetch the updated post with expanded user data
  const fetchUpdatedResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchUpdatedResponse.ok) {
    throw new Error('Failed to fetch updated post');
  }

  return fetchUpdatedResponse.json();
};

export const addReply = async (postId: string, data: AddReplyData) => {
  // First get the current post
  const fetchPostResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchPostResponse.ok) {
    throw new Error('Failed to fetch post');
  }
  const post = await fetchPostResponse.json();

  // Get the user data for the new reply
  const userResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${data.userId}`);
  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data');
  }
  const user = await userResponse.json();

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
            user: user,
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

  const updateResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPost),
  });

  if (!updateResponse.ok) {
    throw new Error('Failed to add reply');
  }

  // Fetch the updated post with expanded user data
  const fetchUpdatedResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchUpdatedResponse.ok) {
    throw new Error('Failed to fetch updated post');
  }

  return fetchUpdatedResponse.json();
};

export const getUserPosts = async (userId: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts?userId=${userId}&_expand=user`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch user posts');
  }
  return response.json();
};

export const getPosts = async (activeTab: string, userId: string) => {
  if (activeTab === 'profile') {
    return getUserPosts(userId);
  } else if (activeTab === 'For you') {
    const response = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts?_expand=user`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  } else {
    return getFollowingPosts(userId);
  }
};

export const getPost = async (postId: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  const post = await response.json();

  // Fetch user data for each comment and reply
  const commentsWithUsers = await Promise.all(
    post.engagement.comments.map(async (comment: Comment) => {
      const userResponse = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/users/${comment.userId}`
      );
      const user = await userResponse.json();

      // If comment has replies, fetch user data for replies too
      let repliesWithUsers: Comment[] = [];
      if (comment.replies) {
        repliesWithUsers = await Promise.all(
          comment.replies.map(async (reply: Comment) => {
            const replyUserResponse = await fetch(
              `${import.meta.env.VITE_JSON_SERVER_URL}/users/${reply.userId}`
            );
            const replyUser = await replyUserResponse.json();
            return { ...reply, user: replyUser };
          })
        );
      }

      return {
        ...comment,
        user,
        replies: repliesWithUsers.length > 0 ? repliesWithUsers : comment.replies,
      };
    })
  );

  return {
    ...post,
    engagement: {
      ...post.engagement,
      comments: commentsWithUsers,
    },
  };
};

export const updatePost = async (postId: string, data: Post) => {
  // Update the post
  const updateResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!updateResponse.ok) {
    throw new Error('Failed to update post');
  }

  // Fetch the updated post with expanded user data
  const fetchUpdatedResponse = await fetch(
    `${import.meta.env.VITE_JSON_SERVER_URL}/posts/${postId}?_expand=user`
  );
  if (!fetchUpdatedResponse.ok) {
    throw new Error('Failed to fetch updated post');
  }

  return fetchUpdatedResponse.json();
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
    const userResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await userResponse.json();

    // Get all posts with expanded user data
    const postsResponse = await fetch(`${import.meta.env.VITE_JSON_SERVER_URL}/posts?_expand=user`);
    if (!postsResponse.ok) {
      throw new Error('Failed to fetch posts');
    }
    const posts = await postsResponse.json();

    // Filter posts by users being followed
    return posts.filter((post: Post) => user.following.includes(post.userId));
  } catch {
    throw new Error('Failed to fetch following posts');
  }
};
