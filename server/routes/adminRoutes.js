const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const appController = require('../controllers/appController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');

// All admin routes require authentication
router.use(authMiddleware);

// --- Existing App Management Routes (Moved from appRoutes) ---
router.get('/apps', appController.getAllAppsAdmin);
router.post('/apps', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.createApp);

router.put('/apps/:id', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.updateApp);

router.put('/apps/:id/release', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.releaseAppUpdate);

router.put('/apps/:id/rollback', appController.rollbackAppUpdate);
router.delete('/apps/:id', appController.deleteApp);
router.patch('/apps/:id/toggle-publish', appController.togglePublish);
router.patch('/apps/:id/toggle-featured', appController.toggleFeatured);
router.patch('/apps/:id/toggle-ab-testing', appController.toggleAbTesting);

// --- Analytics ---
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics/downloads', adminController.getDownloadStats);
router.get('/analytics/bugs-per-version', adminController.getBugsPerVersion);
router.get('/analytics/top-testers', adminController.getTopTesters);
router.get('/analytics/idea-funnel', adminController.getIdeaFunnel);
router.get('/analytics/tester-retention', adminController.getTesterRetention);

// --- Announcements ---
router.post('/announcements', adminController.createAnnouncement);
router.get('/announcements', adminController.getAnnouncements);

// --- Approvals ---
router.get('/enrollments/pending', adminController.getPendingEnrollments);
router.put('/enrollments/:id/approve', adminController.approveEnrollment);
router.put('/enrollments/:id/reject', adminController.rejectEnrollment);

// --- Bug Triage ---
router.get('/bugs', adminController.getTriageBugs);
router.put('/bugs/:id/status', adminController.updateBugStatus);

// --- Exports ---
router.get('/export/csv', adminController.exportCSV);
router.get('/export/pdf', adminController.exportPDF);

module.exports = router;
