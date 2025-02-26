import type User from './user.types';

interface Post {
  id: string;
  userId: string;
  content: {
    text: string;
    images?: string[]; // URLs to images
  };
  engagement: {
    likes: string[]; // Array of user IDs who liked
    comments: Comment[];
    shares: number;
  };
  createdAt: string;
  updatedAt: string;
  language: 'EN' | 'NON-EN';
  user?: User; // Added for json-server _expand
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  likes: string[]; // Array of user IDs who liked
  replies?: Comment[]; // Nested comments
  createdAt: string;
  updatedAt: string;
  user?: User; // Added for json-server _expand
}

export default Post;
export type { Comment };
