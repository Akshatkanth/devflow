import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ─── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data.tokens;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; repoUrl: string; branch?: string; description?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: Partial<{ name: string; repoUrl: string; branch: string; description: string }>) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getDeployments: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/projects/${id}/deployments`, { params }),
};

export const deploymentsApi = {
  get: (id: string) => api.get(`/deployments/${id}`),
  getLogs: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/deployments/${id}/logs`, { params }),
  trigger: (projectId: string, data?: { commitMessage?: string }) =>
    api.post(`/projects/${projectId}/deployments`, data ?? {}),
  cancel: (id: string) => api.post(`/deployments/${id}/cancel`),
};
