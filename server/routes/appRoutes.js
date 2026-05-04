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
adminRouter.post('/apps', uploadFields, appController.createApp);
adminRouter.put('/apps/:id', uploadFields, appController.updateApp);
adminRouter.delete('/apps/:id', appController.deleteApp);
adminRouter.patch('/apps/:id/toggle-publish', appController.togglePublish);
adminRouter.patch('/apps/:id/toggle-featured', appController.toggleFeatured);

module.exports = router;
module.exports.adminRouter = adminRouter;
