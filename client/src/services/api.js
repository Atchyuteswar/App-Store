import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 300000, 
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Public ───────────────────────────
export const getApps = (params) => api.get("/apps", { params });
export const getAppBySlug = (slug) => api.get(`/apps/${slug}`);
export const getDownloadUrl = (slug) => `${API_URL}/api/apps/${slug}/download`;

// ─── Auth ─────────────────────────────
export const login = (credentials) => api.post("/auth/login", credentials);
export const userLogin = (credentials) => api.post("/auth/user/login", credentials);
export const userSignup = (credentials) => api.post("/auth/user/signup", credentials);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// ─── Admin ────────────────────────────
export const getAdminApps = () => api.get("/admin/apps");

export const createApp = (formData, onProgress) =>
  api.post("/admin/apps", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

export const updateApp = (id, formData, onProgress) =>
  api.put(`/admin/apps/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

export const releaseAppUpdate = (id, data) => api.put(`/admin/apps/${id}/release`, data);

export const rollbackAppUpdate = (id, historyIndex) => 
  api.put(`/admin/apps/${id}/rollback`, { historyIndex });

export const deleteApp = (id) => api.delete(`/admin/apps/${id}`);
export const togglePublish = (id) => api.patch(`/admin/apps/${id}/toggle-publish`);
export const toggleFeatured = (id) => api.patch(`/admin/apps/${id}/toggle-featured`);

// --- A/B TESTING ENROLLMENT ---
export const enrollAbTesting = (slug, data) => api.post(`/apps/${slug}/enroll`, data);
export const toggleAbTesting = (id) => api.patch(`/admin/apps/${id}/toggle-ab-testing`);

// --- TESTER HUB ---
export const getTesterEnrollments = () => api.get('/tester/enrollments');
export const getTesterActivity = () => api.get('/tester/activity');

export const getTesterMessages = (slug) => api.get(`/tester/apps/${slug}/messages`);
export const addTesterMessage = (slug, message) => api.post(`/tester/apps/${slug}/messages`, { message });

export const getTesterBugs = (slug) => api.get(`/tester/apps/${slug}/bugs`);
export const addTesterBug = (slug, data) => api.post(`/tester/apps/${slug}/bugs`, data);

export const getTesterIdeas = (slug) => api.get(`/tester/apps/${slug}/ideas`);
export const addTesterIdea = (slug, data) => api.post(`/tester/apps/${slug}/ideas`, data);

export const getFileUrl = (url) => {
  if (!url) return "";
  // Supabase Storage URLs are already absolute
  if (url.startsWith("http")) return url;
  // Fallback for relative paths
  return `${API_URL}/uploads/${url}`;
};

export default api;
