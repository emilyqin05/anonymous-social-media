import api from './axios';

export interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  score: number;
  user_vote?: number;
  created_at: string;
  courseId?: string;
  professor?: string;
  tags: string[];
}

export interface Comment {
  id: number;
  post_id: number;
  username: string;
  content: string;
  score: number;
  user_vote?: number;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  professors: string[];
  description: string;
  followerCount: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Posts API
export const postsApi = {
  getAll: async (params?: { courseId?: string; sortBy?: string; limit?: number }): Promise<Post[]> => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    content: string;
    courseId?: string;
    professor?: string;
    tags?: string[];
  }): Promise<Post> => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  update: async (id: number, data: { title: string; content: string }): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  }
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  }
};

// Comments API
export const commentsApi = {
  getByPostId: async (postId: number): Promise<Comment[]> => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },

  create: async (data: { postId: number; content: string }): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  update: async (id: number, content: string): Promise<void> => {
    await api.put(`/comments/${id}`, { content });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  }
};

// Votes API
export const votesApi = {
  votePost: async (postId: number, voteValue: number): Promise<{ postId: number; score: number; userVote: number | null }> => {
    const response = await api.post('/votes', { postId, voteValue });
    return response.data;
  },

  voteComment: async (commentId: number, voteValue: number): Promise<{ commentId: number; score: number; userVote: number | null }> => {
    const response = await api.post('/votes', { commentId, voteValue });
    return response.data;
  },

  getUserVote: async (id: number, type: 'post' | 'comment'): Promise<{ postId?: number; commentId?: number; userVote: number | null }> => {
    const response = await api.get(`/votes/${id}?type=${type}`);
    return response.data;
  }
};

// Follows API
export const followsApi = {
  followCourse: async (courseId: string): Promise<void> => {
    await api.post('/follows/course', { courseId, action: 'follow' });
  },

  unfollowCourse: async (courseId: string): Promise<void> => {
    await api.post('/follows/course', { courseId, action: 'unfollow' });
  },

  followTag: async (tagName: string): Promise<void> => {
    await api.post('/follows/tag', { tagName, action: 'follow' });
  },

  unfollowTag: async (tagName: string): Promise<void> => {
    await api.post('/follows/tag', { tagName, action: 'unfollow' });
  },

  setProfessorPreference: async (courseId: string, professorName: string): Promise<void> => {
    await api.post('/follows/professor-preference', { courseId, professorName });
  },

  getFollowedCourses: async (): Promise<string[]> => {
    const response = await api.get('/follows/courses');
    return response.data;
  },

  getFollowedTags: async (): Promise<string[]> => {
    const response = await api.get('/follows/tags');
    return response.data;
  },

  getProfessorPreferences: async (): Promise<Record<string, string>> => {
    const response = await api.get('/follows/professor-preferences');
    return response.data;
  }
};

// Users API
export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getFeed: async (params?: { sortBy?: string; limit?: number }): Promise<Post[]> => {
    const response = await api.get('/users/feed', { params });
    return response.data;
  },

  getMyPosts: async (params?: { limit?: number }): Promise<Post[]> => {
    const response = await api.get('/users/posts', { params });
    return response.data;
  }
};

// Tags API (for getting all available tags)
export const tagsApi = {
  getAll: async (): Promise<string[]> => {
    // We'll get tags from posts for now, but could add a dedicated endpoint later
    const posts = await postsApi.getAll();
    const allTags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }
};
