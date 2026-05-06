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
export const getTesterStats = () => api.get('/tester/stats');
export const getTesterActivity = () => api.get('/tester/activity');

export const getTesterMessages = (slug) => api.get(`/tester/apps/${slug}/messages`);
export const addTesterMessage = (slug, message) => api.post(`/tester/apps/${slug}/messages`, { message });

export const getTesterBugs = (slug) => api.get(`/tester/apps/${slug}/bugs`);
export const addTesterBug = (slug, data) => api.post(`/tester/apps/${slug}/bugs`, data);

export const getTesterIdeas = (slug) => api.get(`/tester/apps/${slug}/ideas`);
export const addTesterIdea = (slug, data) => api.post(`/tester/apps/${slug}/ideas`, data);
export const upvoteTesterIdea = (ideaId) => api.post(`/tester/ideas/${ideaId}/upvote`);

export const getTesterNotifications = () => api.get('/tester/notifications');
export const markTesterNotificationRead = (id) => api.patch(`/tester/notifications/${id}/read`);

export const updateTesterProfile = (data) => api.put('/tester/profile', data);
export const updateTesterProfileSettings = (data) => api.put('/tester/profile/settings', data);
export const unenrollTesterApp = (appId) => api.delete(`/tester/enrollments/${appId}`);

// Tasks (New)
export const getTesterTasks = () => api.get('/tester/tasks');
export const completeTesterTask = (taskId, notes) => api.post(`/tester/tasks/${taskId}/complete`, { notes });
export const uncompleteTesterTask = (taskId) => api.delete(`/tester/tasks/${taskId}/uncomplete`);

// Timeline (New)
export const getTesterTimeline = () => api.get('/tester/timeline');

// Crashes (New)
export const reportTesterCrash = (data) => api.post('/tester/crashes', data);

// Ratings (New)
export const getAppRatings = (slug) => api.get(`/tester/apps/${slug}/ratings`);
export const addAppRating = (slug, data) => api.post(`/tester/apps/${slug}/ratings`, data);

// Polls (New)
export const getTesterPolls = () => api.get('/tester/polls');
export const respondToPoll = (pollId, data) => api.post(`/tester/polls/${pollId}/respond`, data);
export const getPollResults = (pollId) => api.get(`/tester/polls/${pollId}/results`);

// Achievements (New)
export const getTesterAchievements = () => api.get('/tester/achievements');

// Leaderboard (New)
export const getTesterLeaderboard = (appId) => api.get('/tester/leaderboard', { params: { appId } });

// Search (New)
export const globalSearch = (q) => api.get('/tester/search', { params: { q } });

// Onboarding (New)
export const getTesterOnboarding = () => api.get('/tester/onboarding');
export const dismissTesterOnboarding = () => api.put('/tester/onboarding/dismiss');

// Public Profile (New)
export const checkUsernameAvailability = (username) => api.get(`/tester/check-username/${username}`);
export const getPublicProfile = (username) => api.get(`/tester/profile/${username}`);

export const getFileUrl = (url) => {
  if (!url) return "";
  // Supabase Storage URLs are already absolute
  if (url.startsWith("http")) return url;
  // Fallback for relative paths
  return `${API_URL}/uploads/${url}`;
};

export default api;
