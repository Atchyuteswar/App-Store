const supabase = require('../lib/supabase');

// --- ACHIEVEMENT DEFINITIONS ---------------------------
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

// ─── GET ENROLLMENTS ────────────────────────────────────
exports.getEnrollments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ab_test_enrollments')
      .select(`
        id,
        status,
        created_at,
        app:apps (
          id,
          name,
          slug,
          icon,
          tagline,
          version,
          category
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getEnrollments error:', err);
    res.status(500).json({ message: 'Server error fetching enrollments' });
  }
};

// ─── CHAT MESSAGES ──────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_messages')
      .select(`
        id,
        message,
        created_at,
        user:users ( username )
      `)
      .eq('app_id', app.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_messages')
      .insert({
        app_id: app.id,
        user_id: req.user.id,
        message
      })
      .select(`
        id,
        message,
        created_at,
        user:users ( username )
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── BUGS ───────────────────────────────────────────────
exports.getBugs = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_bugs')
      .select(`
        id,
        title,
        description,
        severity,
        steps,
        attachments,
        status,
        created_at,
        user:users ( username ),
        app:apps ( name, slug )
      `)
      .eq('app_id', app.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addBug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, severity, steps, attachments } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_bugs')
      .insert({
        app_id: app.id,
        user_id: req.user.id,
        title,
        description,
        severity: severity || 'medium',
        steps: steps || '',
        attachments: attachments || [],
        status: 'open'
      })
      .select(`
        id,
        title,
        description,
        severity,
        steps,
        attachments,
        status,
        created_at,
        user:users ( username )
      `)
      .single();

    if (error) throw error;
    
    const achievements = await checkAndGrantAchievements(req.user.id);
    res.status(201).json({ ...data, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── IDEAS ──────────────────────────────────────────────
exports.getIdeas = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_ideas')
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        user:users ( username ),
        app:apps ( name, slug ),
        upvotes:tester_idea_upvotes( count )
      `)
      .eq('app_id', app.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addIdea = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_ideas')
      .insert({
        app_id: app.id,
        user_id: req.user.id,
        title,
        description,
        category: category || 'feature',
        status: 'submitted'
      })
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        user:users ( username )
      `)
      .single();

    if (error) throw error;
    
    const achievements = await checkAndGrantAchievements(req.user.id);
    res.status(201).json({ ...data, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ACTIVITY & FEED ────────────────────────────────────
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const aYearAgo = new Date();
    aYearAgo.setDate(aYearAgo.getDate() - 365);
    const dateLimit = aYearAgo.toISOString();

    // Fetch detailed records
    const [msgs, bugs, ideas, tasks] = await Promise.all([
      supabase.from('tester_messages').select('id, created_at, message, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10),
      supabase.from('tester_bugs').select('id, created_at, title, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10),
      supabase.from('tester_ideas').select('id, created_at, title, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10),
      supabase.from('tester_task_completions').select('id, completed_at, task:tester_tasks(title, app:apps(name))').eq('user_id', userId).gte('completed_at', dateLimit).order('completed_at', { ascending: false }).limit(10)
    ]);

    // 1. Heatmap Logic (Aggregate all dates)
    const allActivityDates = [
      ...(msgs.data || []).map(m => m.created_at.split('T')[0]),
      ...(bugs.data || []).map(b => b.created_at.split('T')[0]),
      ...(ideas.data || []).map(i => i.created_at.split('T')[0]),
      ...(tasks.data || []).map(t => t.completed_at.split('T')[0])
    ];

    const countsByDate = allActivityDates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const today = new Date().toISOString().split('T')[0];
    if (countsByDate[today] === undefined) countsByDate[today] = 0;

    let maxCount = Math.max(...Object.values(countsByDate), 0);
    const getLevel = (count) => {
      if (count === 0) return 0;
      if (maxCount <= 4) return count;
      const ratio = count / maxCount;
      if (ratio <= 0.25) return 1;
      if (ratio <= 0.5) return 2;
      if (ratio <= 0.75) return 3;
      return 4;
    };

    const heatmap = Object.keys(countsByDate).map(date => ({
      date,
      count: countsByDate[date],
      level: getLevel(countsByDate[date])
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Recent Feed Logic
    const recent = [
      ...(msgs.data || []).map(m => ({
        id: m.id,
        type: 'message',
        description: `Sent a message in ${m.app?.name || 'an app'}`,
        timestamp: m.created_at,
        icon: 'MessageSquare'
      })),
      ...(bugs.data || []).map(b => ({
        id: b.id,
        type: 'bug',
        description: `Reported bug: ${b.title} in ${b.app?.name || 'an app'}`,
        timestamp: b.created_at,
        icon: 'Bug'
      })),
      ...(ideas.data || []).map(i => ({
        id: i.id,
        type: 'idea',
        description: `Suggested idea: ${i.title} for ${i.app?.name || 'an app'}`,
        timestamp: i.created_at,
        icon: 'Lightbulb'
      })),
      ...(tasks.data || []).map(t => ({
        id: t.id,
        type: 'task',
        description: `Completed task: ${t.task?.title || 'a task'} for ${t.task?.app?.name || 'an app'}`,
        timestamp: t.completed_at,
        icon: 'CheckCircle2'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

    res.json({ heatmap, recent });
  } catch (err) {
    console.error('getActivity error:', err);
    res.status(500).json({ message: 'Server error generating activity' });
  }
};

// --- UPVOTES -------------------------------------------
exports.upvoteIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    const { data: existing } = await supabase
      .from('tester_idea_upvotes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      await supabase.from('tester_idea_upvotes').delete().eq('id', existing.id);
      return res.json({ upvoted: false });
    }

    const { error } = await supabase.from('tester_idea_upvotes').insert({
      idea_id: ideaId,
      user_id: req.user.id
    });

    if (error) throw error;
    res.json({ upvoted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error upvoting' });
  }
};

// --- NOTIFICATIONS -------------------------------------
exports.getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- PROFILE -------------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { 
      deviceModel, manufacturer, osVersion, 
      displayName, bio, profileImage,
      prefsNewReleases, prefsBugUpdates, prefsIdeaUpdates, prefsWeeklyDigest 
    } = req.body;
    
    const updates = {};
    if (deviceModel !== undefined) updates.device_model = deviceModel;
    if (manufacturer !== undefined) updates.manufacturer = manufacturer;
    if (osVersion !== undefined) updates.os_version = osVersion;
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (profileImage !== undefined) updates.profile_image = profileImage;
    if (prefsNewReleases !== undefined) updates.prefs_new_releases = prefsNewReleases;
    if (prefsBugUpdates !== undefined) updates.prefs_bug_updates = prefsBugUpdates;
    if (prefsIdeaUpdates !== undefined) updates.prefs_idea_updates = prefsIdeaUpdates;
    if (prefsWeeklyDigest !== undefined) updates.prefs_weekly_digest = prefsWeeklyDigest;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select(`
        id, username, email, display_name, profile_image, bio,
        device_model, manufacturer, os_version,
        prefs_new_releases, prefs_bug_updates, prefs_idea_updates, prefs_weekly_digest,
        profile_public, email_notify_digest, created_at
      `)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// --- UNENROLL ------------------------------------------
exports.unenrollApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const { error } = await supabase
      .from('ab_test_enrollments')
      .delete()
      .eq('app_id', appId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error unenrolling' });
  }
};
// --- DASHBOARD STATS -----------------------------------
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [enrollCount, bugCount, ideaCount] = await Promise.all([
      supabase.from('ab_test_enrollments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('tester_bugs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('tester_ideas').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    const totalActions = (enrollCount.count || 0) + (bugCount.count || 0) + (ideaCount.count || 0);

    // --- Real Streak Calculation ---
    const [msgsDates, bugsDates, ideasDates] = await Promise.all([
      supabase.from('tester_messages').select('created_at').eq('user_id', userId),
      supabase.from('tester_bugs').select('created_at').eq('user_id', userId),
      supabase.from('tester_ideas').select('created_at').eq('user_id', userId)
    ]);

    const allDates = [
      ...(msgsDates.data || []),
      ...(bugsDates.data || []),
      ...(ideasDates.data || [])
    ].map(item => item.created_at.split('T')[0]);

    const uniqueSortedDates = [...new Set(allDates)].sort((a, b) => new Date(b) - new Date(a));
    
    let activityStreak = 0;
    if (uniqueSortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let current = uniqueSortedDates[0];
      if (current === today || current === yesterday) {
        activityStreak = 1;
        for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
          const d1 = new Date(uniqueSortedDates[i]);
          const d2 = new Date(uniqueSortedDates[i+1]);
          const diffDays = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            activityStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      totalEnrollments: enrollCount.count || 0,
      totalBugs: bugCount.count || 0,
      totalIdeas: ideaCount.count || 0,
      totalMessages: msgsDates.data?.length || 0,
      activityStreak,
      testerLevel: Math.floor(totalActions / 10) + 1,
      totalActions
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// --- TASKS ---------------------------------------------
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: enrollments } = await supabase.from('ab_test_enrollments').select('app_id').eq('user_id', userId);
    const appIds = (enrollments || []).map(e => e.app_id);

    const { data: tasks, error } = await supabase
      .from('tester_tasks')
      .select(`
        *,
        app:apps(name, icon, slug),
        completions:tester_task_completions(*)
      `)
      .in('app_id', appIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedTasks = tasks.map(task => ({
      ...task,
      isCompleted: task.completions.some(c => c.user_id === userId),
      userCompletion: task.completions.find(c => c.user_id === userId) || null
    }));

    res.json(processedTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('tester_task_completions')
      .upsert({ task_id: taskId, user_id: userId, notes, completed_at: new Date() });

    if (error) throw error;

    const achievements = await checkAndGrantAchievements(userId);
    res.json({ success: true, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uncompleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('tester_task_completions')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- TIMELINE ------------------------------------------
exports.getTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: enrollments } = await supabase
      .from('ab_test_enrollments')
      .select('app:apps(id, name, icon, version, version_history, created_at)')
      .eq('user_id', userId);

    const timeline = [];
    (enrollments || []).forEach(e => {
      const app = e.app;
      timeline.push({
        appId: app.id,
        appName: app.name,
        appIcon: app.icon,
        version: app.version,
        releasedAt: app.created_at,
        releaseNotes: 'Initial Release',
        isCurrent: true
      });

      if (Array.isArray(app.version_history)) {
        app.version_history.forEach(v => {
          timeline.push({
            appId: app.id,
            appName: app.name,
            appIcon: app.icon,
            version: v.version,
            releasedAt: v.date,
            releaseNotes: v.notes,
            isCurrent: false
          });
        });
      }
    });

    timeline.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
    res.json(timeline);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- CRASHES -------------------------------------------
exports.addCrash = async (req, res) => {
  try {
    const { appId, appVersion, os, osVersion, deviceModel, manufacturer, description } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('tester_crashes')
      .insert({
        app_id: appId,
        user_id: userId,
        app_version: appVersion,
        os,
        os_version: osVersion,
        device_model: deviceModel,
        manufacturer,
        description
      })
      .select()
      .single();

    if (error) throw error;

    const achievements = await checkAndGrantAchievements(userId);
    res.status(201).json({ ...data, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- RATINGS -------------------------------------------
exports.addRating = async (req, res) => {
  try {
    const { slug } = req.params;
    const { version, stars, comment } = req.body;
    const userId = req.user.id;

    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_ratings')
      .upsert({ app_id: app.id, user_id: userId, version, stars, comment }, { onConflict: 'app_id,user_id,version' })
      .select()
      .single();

    if (error) throw error;

    const achievements = await checkAndGrantAchievements(userId);
    res.json({ ...data, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppRatings = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data: ratings } = await supabase.from('tester_ratings').select('*').eq('app_id', app.id);
    const { data: myRating } = await supabase.from('tester_ratings').select('*').eq('app_id', app.id).eq('user_id', req.user.id).single();

    res.json({ ratings, myRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- POLLS ---------------------------------------------
exports.getPolls = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: enrollments } = await supabase.from('ab_test_enrollments').select('app_id').eq('user_id', userId);
    const appIds = (enrollments || []).map(e => e.app_id);

    // Get polls for enrolled apps OR platform-wide (null app_id)
    const { data: polls } = await supabase
      .from('tester_polls')
      .select('*, app:apps(name), responses:tester_poll_responses(user_id)')
      .or(`app_id.in.(${appIds.join(',')}),app_id.is.null`)
      .order('created_at', { ascending: false });

    const processedPolls = (polls || []).map(poll => ({
      ...poll,
      hasResponded: poll.responses.some(r => r.user_id === userId)
    }));

    res.json(processedPolls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { selectedOptions, textResponse } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('tester_poll_responses')
      .insert({ poll_id: pollId, user_id: userId, selected_options: selectedOptions, text_response: textResponse });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { data: responses } = await supabase.from('tester_poll_responses').select('*').eq('poll_id', pollId);
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- LEADERBOARD ---------------------------------------
exports.getLeaderboard = async (req, res) => {
  try {
    const { appId } = req.query;
    
    // In a real high-traffic app, this would be a materialized view or cached
    const [bugs, ideas, msgs, tasks, users] = await Promise.all([
      supabase.from('tester_bugs').select('user_id, app_id'),
      supabase.from('tester_ideas').select('user_id, app_id'),
      supabase.from('tester_messages').select('user_id, app_id'),
      supabase.from('tester_task_completions').select('user_id, task:tester_tasks(app_id)'),
      supabase.from('users').select('id, username, display_name, profile_image').eq('role', 'user')
    ]);

    const scores = {};
    users.data.forEach(u => {
      scores[u.id] = { 
        userId: u.id, 
        name: u.display_name || u.username, 
        avatar: u.profile_image,
        bugs: 0, ideas: 0, msgs: 0, tasks: 0, score: 0 
      };
    });

    const filter = (item) => !appId || item.app_id === appId;
    const taskFilter = (item) => !appId || item.task?.app_id === appId;

    bugs.data?.filter(filter).forEach(b => { if(scores[b.user_id]) { scores[b.user_id].bugs++; scores[b.user_id].score += 3; } });
    ideas.data?.filter(filter).forEach(i => { if(scores[i.user_id]) { scores[i.user_id].ideas++; scores[i.user_id].score += 2; } });
    msgs.data?.filter(filter).forEach(m => { if(scores[m.user_id]) { scores[m.user_id].msgs++; scores[m.user_id].score += 1; } });
    tasks.data?.filter(taskFilter).forEach(t => { if(scores[t.user_id]) { scores[t.user_id].tasks++; scores[t.user_id].score += 4; } });

    const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- ACHIEVEMENTS --------------------------------------
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: unlocked } = await supabase.from('tester_achievements').select('*').eq('user_id', userId);
    
    const allAchievements = Object.keys(ACHIEVEMENTS).map(key => ({
      key,
      ...ACHIEVEMENTS[key],
      unlockedAt: unlocked.find(u => u.achievement_key === key)?.unlocked_at || null
    }));

    res.json(allAchievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- PROFILE & SETTINGS --------------------------------
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { data } = await supabase.from('users').select('id').eq('username', username.toLowerCase()).single();
    res.json({ available: !data });
  } catch (err) {
    res.json({ available: true });
  }
};

exports.updateProfileSettings = async (req, res) => {
  try {
    const { username, profilePublic, emailNotifyDigest } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (username !== undefined) updates.username = username?.toLowerCase();
    if (profilePublic !== undefined) updates.profile_public = profilePublic;
    if (emailNotifyDigest !== undefined) updates.email_notify_digest = emailNotifyDigest;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('updateProfileSettings error:', err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fetching public profile for:', username);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, profile_image, created_at, profile_public')
      .ilike('username', username.toLowerCase())
      .single();

    if (error || !user) {
      console.log('User not found or error:', error, 'Requested username:', username);
      return res.status(404).json({ 
        message: 'Profile not found', 
        debug: { searched: username.toLowerCase(), error: error?.message } 
      });
    }

    if (user.profile_public === false) {
      console.log('Profile is private for:', username);
      return res.status(404).json({ 
        message: 'Profile not found', 
        debug: { searched: username.toLowerCase(), privacy: 'private' } 
      });
    }

    const [achRes, bugRes, ideaRes, taskRes] = await Promise.all([
      supabase.from('tester_achievements').select('achievement_key').eq('user_id', user.id),
      supabase.from('tester_bugs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tester_ideas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tester_task_completions').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    res.json({
      ...user,
      achievements: (achRes.data || []).map(a => ({ key: a.achievement_key, ...ACHIEVEMENTS[a.achievement_key] })),
      stats: {
        bugs: bugRes.count || 0,
        ideas: ideaRes.count || 0,
        tasks: taskRes.count || 0
      }
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- GLOBAL SEARCH -------------------------------------
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    if (!q || q.length < 2) return res.json({ results: [] });

    const [apps, bugs, ideas, msgs, tasks] = await Promise.all([
      supabase.from('apps').select('id, name, version, slug').ilike('name', `%${q}%`).limit(5),
      supabase.from('tester_bugs').select('id, title, status, app:apps(name)').eq('user_id', userId).ilike('title', `%${q}%`).limit(5),
      supabase.from('tester_ideas').select('id, title, status, app:apps(name)').eq('user_id', userId).ilike('title', `%${q}%`).limit(5),
      supabase.from('tester_messages').select('id, message, app:apps(name)').eq('user_id', userId).ilike('message', `%${q}%`).limit(5),
      supabase.from('tester_tasks').select('id, title, app:apps(name)').ilike('title', `%${q}%`).limit(5)
    ]);

    res.json({
      apps: apps.data || [],
      bugs: bugs.data || [],
      ideas: ideas.data || [],
      messages: msgs.data || [],
      tasks: tasks.data || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- ONBOARDING ----------------------------------------
exports.getOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    let { data: onboarding } = await supabase.from('tester_onboarding').select('*').eq('user_id', userId).single();
    
    if (!onboarding) {
      const { data: fresh } = await supabase.from('tester_onboarding').insert({ user_id: userId }).select().single();
      onboarding = fresh;
    }
    
    res.json(onboarding);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.dismissOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    await supabase.from('tester_onboarding').update({ dismissed: true }).eq('user_id', userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
