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
