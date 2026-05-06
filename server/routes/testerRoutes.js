const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const testerController = require('../controllers/testerController');

const router = express.Router();

// Require auth for all tester routes
router.use(authMiddleware);

router.get('/enrollments', testerController.getEnrollments);
router.get('/activity', testerController.getActivity);

router.get('/apps/:slug/messages', testerController.getMessages);
router.post('/apps/:slug/messages', testerController.addMessage);

router.get('/apps/:slug/bugs', testerController.getBugs);
router.post('/apps/:slug/bugs', testerController.addBug);

router.get('/apps/:slug/ideas', testerController.getIdeas);
router.post('/apps/:slug/ideas', testerController.addIdea);
router.post('/ideas/:ideaId/upvote', testerController.upvoteIdea);

router.get('/notifications', testerController.getNotifications);
router.patch('/notifications/:id/read', testerController.markNotificationRead);

router.put('/profile', testerController.updateProfile);
router.delete('/enrollments/:appId', testerController.unenrollApp);

module.exports = router;
