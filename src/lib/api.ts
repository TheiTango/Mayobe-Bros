const API_BASE_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    logout: () =>
      fetchAPI('/auth/logout', { method: 'POST' }),

    getSession: () =>
      fetchAPI('/auth/session'),
  },

  posts: {
    list: (params?: { category?: string; label?: string; status?: string; search?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI(`/posts${query ? `?${query}` : ''}`);
    },

    get: (slug: string) =>
      fetchAPI(`/posts/${slug}`),

    create: (data: any) =>
      fetchAPI('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (slug: string, data: any) =>
      fetchAPI(`/posts/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (slug: string) =>
      fetchAPI(`/posts/${slug}`, { method: 'DELETE' }),
  },

  pages: {
    list: (params?: { status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI(`/pages${query ? `?${query}` : ''}`);
    },

    get: (slug: string) =>
      fetchAPI(`/pages/${slug}`),

    create: (data: any) =>
      fetchAPI('/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (slug: string, data: any) =>
      fetchAPI(`/pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (slug: string) =>
      fetchAPI(`/pages/${slug}`, { method: 'DELETE' }),
  },

  categories: {
    list: () => fetchAPI('/categories'),

    create: (data: any) =>
      fetchAPI('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      fetchAPI(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/categories/${id}`, { method: 'DELETE' }),
  },

  labels: {
    list: () => fetchAPI('/labels'),

    create: (data: any) =>
      fetchAPI('/labels', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      fetchAPI(`/labels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/labels/${id}`, { method: 'DELETE' }),
  },

  images: {
    list: () => fetchAPI('/images'),

    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },

    delete: (filename: string) =>
      fetchAPI(`/images/${filename}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => fetchAPI('/settings'),

    update: (data: any) =>
      fetchAPI('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  comments: {
    list: (params?: { postId?: string; status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI(`/comments${query ? `?${query}` : ''}`);
    },

    create: (data: any) =>
      fetchAPI('/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      fetchAPI(`/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/comments/${id}`, { method: 'DELETE' }),
  },

  reviews: {
    list: (params?: { status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetchAPI(`/reviews${query ? `?${query}` : ''}`);
    },

    create: (data: any) =>
      fetchAPI('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      fetchAPI(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/reviews/${id}`, { method: 'DELETE' }),
  },
};
