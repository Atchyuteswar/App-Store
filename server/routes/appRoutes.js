const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');

// Public Routes (/api/apps)
router.get('/', appController.getAllApps);
router.get('/:slug', appController.getAppBySlug);
router.get('/:slug/download', appController.downloadApp);

// Admin Routes (exported separately)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);

adminRouter.get('/apps', appController.getAllAppsAdmin);

// Handle both direct JSON (new way) and Multer FormData (old way/fallback)
adminRouter.post('/apps', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.createApp);

adminRouter.put('/apps/:id', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.updateApp);

adminRouter.put('/apps/:id/release', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return uploadFields(req, res, next);
  }
  next();
}, appController.releaseAppUpdate);

adminRouter.put('/apps/:id/rollback', appController.rollbackAppUpdate);

adminRouter.delete('/apps/:id', appController.deleteApp);
adminRouter.patch('/apps/:id/toggle-publish', appController.togglePublish);
adminRouter.patch('/apps/:id/toggle-featured', appController.toggleFeatured);

module.exports = router;
module.exports.adminRouter = adminRouter;
