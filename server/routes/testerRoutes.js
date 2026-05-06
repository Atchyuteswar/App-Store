const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const testerController = require('../controllers/testerController');

const router = express.Router();

// Public routes (no auth required)
router.get('/profile/:username', testerController.getPublicProfile);
router.get('/check-username/:username', testerController.checkUsername);

// Require auth for all subsequent tester routes
router.use(authMiddleware);

router.get('/enrollments', testerController.getEnrollments);
router.get('/dashboard-summary', testerController.getDashboardSummary);
router.get('/stats', testerController.getStats);
router.get('/activity', testerController.getActivity);

// Apps & Feedback
router.get('/apps/:slug/messages', testerController.getMessages);
router.post('/apps/:slug/messages', testerController.addMessage);
router.get('/apps/:slug/bugs', testerController.getBugs);
router.post('/apps/:slug/bugs', testerController.addBug);
router.get('/apps/:slug/ideas', testerController.getIdeas);
router.post('/apps/:slug/ideas', testerController.addIdea);
router.post('/ideas/:ideaId/upvote', testerController.upvoteIdea);

// Tasks (New)
router.get('/tasks', testerController.getTasks);
router.post('/tasks/:taskId/complete', testerController.completeTask);
router.delete('/tasks/:taskId/uncomplete', testerController.uncompleteTask);

// Timeline (New)
router.get('/timeline', testerController.getTimeline);

// Crashes (New)
router.post('/crashes', testerController.addCrash);

// Ratings (New)
router.get('/apps/:slug/ratings', testerController.getAppRatings);
router.post('/apps/:slug/ratings', testerController.addRating);

// Polls (New)
router.get('/polls', testerController.getPolls);
router.post('/polls/:pollId/respond', testerController.respondToPoll);
router.get('/polls/:pollId/results', testerController.getPollResults);

// Achievements (New)
router.get('/achievements', testerController.getAchievements);

// Leaderboard (New)
router.get('/leaderboard', testerController.getLeaderboard);

// Search (New)
router.get('/search', testerController.globalSearch);

// Onboarding (New)
router.get('/onboarding', testerController.getOnboarding);
router.put('/onboarding/dismiss', testerController.dismissOnboarding);

// Profile & Settings
router.put('/profile', testerController.updateProfile);
router.put('/profile/settings', testerController.updateProfileSettings);
router.delete('/enrollments/:appId', testerController.unenrollApp);

module.exports = router;
