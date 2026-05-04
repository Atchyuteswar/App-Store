import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// ─── Public ───────────────────────────
export const getApps = (params) => api.get("/apps", { params });
export const getAppBySlug = (slug) => api.get(`/apps/${slug}`);
export const getDownloadUrl = (slug) => `${API_URL}/api/apps/${slug}/download`;

// ─── Auth ─────────────────────────────
export const login = (credentials) => api.post("/auth/login", credentials);
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

export const deleteApp = (id) => api.delete(`/admin/apps/${id}`);
export const togglePublish = (id) => api.patch(`/admin/apps/${id}/toggle-publish`);
export const toggleFeatured = (id) => api.patch(`/admin/apps/${id}/toggle-featured`);

export const getFileUrl = (url) => {
  if (!url) return "";
  // Supabase Storage URLs are already absolute
  if (url.startsWith("http")) return url;
  // Fallback for relative paths
  return `${API_URL}/uploads/${url}`;
};

export default api;
