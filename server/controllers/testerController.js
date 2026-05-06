const supabase = require('../lib/supabase');

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
    res.status(201).json(data);
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
    res.status(201).json(data);
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
    const [msgs, bugs, ideas] = await Promise.all([
      supabase.from('tester_messages').select('id, created_at, message, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10),
      supabase.from('tester_bugs').select('id, created_at, title, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10),
      supabase.from('tester_ideas').select('id, created_at, title, app:apps(name)').eq('user_id', userId).gte('created_at', dateLimit).order('created_at', { ascending: false }).limit(10)
    ]);

    // 1. Heatmap Logic (Aggregate all dates)
    const allActivityDates = [
      ...(msgs.data || []).map(m => m.created_at.split('T')[0]),
      ...(bugs.data || []).map(b => b.created_at.split('T')[0]),
      ...(ideas.data || []).map(i => i.created_at.split('T')[0])
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
    const { deviceModel, manufacturer, osVersion, prefsNewReleases, prefsBugUpdates, prefsIdeaUpdates, prefsWeeklyDigest } = req.body;
    
    const updates = {};
    if (deviceModel !== undefined) updates.device_model = deviceModel;
    if (manufacturer !== undefined) updates.manufacturer = manufacturer;
    if (osVersion !== undefined) updates.os_version = osVersion;
    if (prefsNewReleases !== undefined) updates.prefs_new_releases = prefsNewReleases;
    if (prefsBugUpdates !== undefined) updates.prefs_bug_updates = prefsBugUpdates;
    if (prefsIdeaUpdates !== undefined) updates.prefs_idea_updates = prefsIdeaUpdates;
    if (prefsWeeklyDigest !== undefined) updates.prefs_weekly_digest = prefsWeeklyDigest;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, username, email, device_model, manufacturer, os_version, prefs_new_releases, prefs_bug_updates, prefs_idea_updates, prefs_weekly_digest')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
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
