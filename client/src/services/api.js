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

// Extract data from standard wrapper if present
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// --- ADMIN ANALYTICS ---
export const getAnalyticsOverview = (params) => api.get('/admin/analytics/overview', { params });
export const getDownloadStats = (params) => api.get('/admin/analytics/downloads', { params });
export const getBugsPerVersion = (params) => api.get('/admin/analytics/bugs-per-version', { params });
export const getTopTesters = (params) => api.get('/admin/analytics/top-testers', { params });
export const getIdeaFunnel = (params) => api.get('/admin/analytics/idea-funnel', { params });
export const getTesterRetention = (params) => api.get('/admin/analytics/tester-retention', { params });

// --- ADMIN ANNOUNCEMENTS ---
export const createAnnouncement = (data) => api.post('/admin/announcements', data);
export const getAnnouncements = (params) => api.get('/admin/announcements', { params });

// --- ADMIN APPROVALS ---
export const getPendingEnrollments = () => api.get('/admin/enrollments/pending');
export const approveEnrollment = (id) => api.put(`/admin/enrollments/${id}/approve`);
export const rejectEnrollment = (id, data) => api.put(`/admin/enrollments/${id}/reject`, data);

// --- ADMIN BUG TRIAGE ---
export const getTriageBugs = (params) => api.get('/admin/bugs', { params });
export const updateBugStatus = (id, status) => api.put(`/admin/bugs/${id}/status`, { status });
export const updateBugPriority = (id, priority) => api.put(`/admin/bugs/${id}/priority`, { priority });
export const updateBugNotes = (id, notes) => api.put(`/admin/bugs/${id}/notes`, { internalNotes: notes });
export const replyToBug = (id, message) => api.post(`/admin/bugs/${id}/reply`, { message });
export const markBugDuplicate = (id, duplicateOfId) => api.put(`/admin/bugs/${id}/duplicate`, { duplicateOfId });

// --- ADMIN EXPORTS ---
export const getExportCSVUrl = (params) => {
  const query = new URLSearchParams(params).toString();
  return `${API_URL}/api/admin/export/csv?${query}`;
};
export const getExportPDFUrl = (params) => {
  const query = new URLSearchParams(params).toString();
  return `${API_URL}/api/admin/export/pdf?${query}`;
};

// --- TESTER HUB ---
export const getTesterEnrollments = () => api.get('/tester/enrollments');
export const getTesterDashboardSummary = () => api.get('/tester/dashboard-summary');
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

// --- TESTER VERSION COMPARE ---
export const getVersionComparison = (slug, params) => api.get(`/tester/apps/${slug}/compare`, { params });

// --- TESTER DUPLICATE BUGS ---
export const getSimilarBugs = (params) => api.get('/tester/bugs/similar', { params });

// --- TESTER INSTALLS ---
export const confirmInstall = (data) => api.post('/tester/installs', data);
export const getInstallHistory = () => api.get('/tester/installs');
export const getAppInstallsAdmin = (appId) => api.get(`/admin/apps/${appId}/installs`);

export const getFileUrl = (url) => {
  if (!url) return "";
  // Supabase Storage URLs are already absolute
  if (url.startsWith("http")) return url;
  // Fallback for relative paths
  return `${API_URL}/uploads/${url}`;
};

export default api;
