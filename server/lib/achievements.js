const supabase = require('./supabase');

const ACHIEVEMENTS = {
  first_bug: { name: 'Bug Hunter', description: 'Filed your first bug', icon: 'Bug' },
  bug_10: { name: 'Debugger', description: 'Filed 10 bugs', icon: 'Terminal' },
  first_idea: { name: 'Visionary', description: 'Submitted your first idea', icon: 'Lightbulb' },
  idea_10: { name: 'Innovator', description: 'Submitted 10 ideas', icon: 'Zap' },
  streak_7: { name: 'Week Warrior', description: '7-day activity streak', icon: 'Calendar' },
  streak_30: { name: 'Monthly Legend', description: '30-day streak', icon: 'Trophy' },
  first_task: { name: 'On It', description: 'Completed your first task', icon: 'CheckCircle' },
  all_tasks: { name: 'Completionist', description: 'Completed all assigned tasks for an app', icon: 'Award' },
  first_rating: { name: 'Critic', description: 'Rated your first app version', icon: 'Star' },
  veteran: { name: 'Veteran Tester', description: 'Active for 90+ days', icon: 'Shield' }
};

const checkAndGrantAchievements = async (userId) => {
  try {
    const newlyUnlocked = [];
    const [bugs, ideas, tasks, user, unlocked] = await Promise.all([
      supabase.from('tester_bugs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('tester_ideas').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('tester_task_completions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('users').select('created_at').eq('id', userId).single(),
      supabase.from('tester_achievements').select('achievement_key').eq('user_id', userId)
    ]);

    const unlockedKeys = new Set((unlocked.data || []).map(a => a.achievement_key));

    const check = async (key, condition) => {
      if (!unlockedKeys.has(key) && condition) {
        await supabase.from('tester_achievements').insert({ user_id: userId, achievement_key: key });
        newlyUnlocked.push({ key, ...ACHIEVEMENTS[key] });
      }
    };

    await check('first_bug', bugs.count >= 1);
    await check('bug_10', bugs.count >= 10);
    await check('first_idea', ideas.count >= 1);
    await check('idea_10', ideas.count >= 10);
    await check('first_task', tasks.count >= 1);

    const daysSinceJoined = Math.ceil((new Date() - new Date(user.data.created_at)) / (1000 * 60 * 60 * 24));
    await check('veteran', daysSinceJoined >= 90);

    return newlyUnlocked;
  } catch (err) {
    console.error('Achievement error:', err);
    return [];
  }
};

module.exports = {
  ACHIEVEMENTS,
  checkAndGrantAchievements
};
