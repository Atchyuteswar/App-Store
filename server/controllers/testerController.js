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
        status,
        created_at,
        user:users ( username )
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
    const { title, description } = req.body;
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
        status: 'open'
      })
      .select(`
        id,
        title,
        description,
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
        created_at,
        user:users ( username )
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
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    const { data: app } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('tester_ideas')
      .insert({
        app_id: app.id,
        user_id: req.user.id,
        title,
        description
      })
      .select(`
        id,
        title,
        description,
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

// ─── ACTIVITY CALENDAR ──────────────────────────────────
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    // Calculate date exactly 365 days ago
    const aYearAgo = new Date();
    aYearAgo.setDate(aYearAgo.getDate() - 365);
    const dateLimit = aYearAgo.toISOString();

    // Fetch from all three tables
    const [msgs, bugs, ideas] = await Promise.all([
      supabase.from('tester_messages').select('created_at').eq('user_id', userId).gte('created_at', dateLimit),
      supabase.from('tester_bugs').select('created_at').eq('user_id', userId).gte('created_at', dateLimit),
      supabase.from('tester_ideas').select('created_at').eq('user_id', userId).gte('created_at', dateLimit)
    ]);

    const allDates = [
      ...(msgs.data || []),
      ...(bugs.data || []),
      ...(ideas.data || [])
    ].map(item => item.created_at.split('T')[0]); // Extract just YYYY-MM-DD

    // Count by date
    const countsByDate = allDates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Always include today's date even if 0, so the calendar anchors properly
    const today = new Date().toISOString().split('T')[0];
    if (countsByDate[today] === undefined) {
      countsByDate[today] = 0;
    }

    // Determine max count for leveling
    let maxCount = 0;
    for (const count of Object.values(countsByDate)) {
      if (count > maxCount) maxCount = count;
    }

    // Function to calculate level (0-4) based on relative activity
    const getLevel = (count) => {
      if (count === 0) return 0;
      if (maxCount <= 4) return count; // If low overall activity, 1:1 mapping up to 4
      
      const ratio = count / maxCount;
      if (ratio <= 0.25) return 1;
      if (ratio <= 0.5) return 2;
      if (ratio <= 0.75) return 3;
      return 4;
    };

    const activityData = Object.keys(countsByDate).map(date => ({
      date,
      count: countsByDate[date],
      level: getLevel(countsByDate[date])
    }));

    // Sort by date ascending
    activityData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(activityData);
  } catch (err) {
    console.error('getActivity error:', err);
    res.status(500).json({ message: 'Server error generating activity' });
  }
};
