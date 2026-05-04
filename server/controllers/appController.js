const supabase = require('../lib/supabase');
const slugify = require('slugify');
const { uploadToStorage, deleteFromStorage } = require('../middleware/uploadMiddleware');

// Transform snake_case DB row to camelCase for frontend compatibility
function toCamel(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    whatsNew: row.whats_new,
    category: row.category,
    tags: row.tags || [],
    icon: row.icon,
    screenshots: row.screenshots || [],
    apkFile: row.apk_file,
    version: row.version,
    size: row.size,
    platform: row.platform,
    minOSVersion: row.min_os_version,
    rating: parseFloat(row.rating) || 0,
    downloads: row.downloads || 0,
    featured: row.featured,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── PUBLIC ─────────────────────────────────────────────

exports.getAllApps = async (req, res) => {
  try {
    const { category, search, featured, platform } = req.query;
    let query = supabase.from('apps').select('*').eq('published', true);

    if (category && category !== 'All') query = query.eq('category', category);
    if (platform) query = query.eq('platform', platform);
    if (featured === 'true') query = query.eq('featured', true);
    if (search) {
      query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json(data.map(toCamel));
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppBySlug = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();

    if (error || !data) return res.status(404).json({ message: 'App not found' });
    res.json(toCamel(data));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.downloadApp = async (req, res) => {
  try {
    const { data: app, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error || !app || !app.apk_file) {
      return res.status(404).json({ message: 'App file not found' });
    }

    // Increment download count
    await supabase
      .from('apps')
      .update({ downloads: (app.downloads || 0) + 1 })
      .eq('id', app.id);

    // Redirect to the Supabase Storage URL
    res.redirect(app.apk_file);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADMIN ──────────────────────────────────────────────

exports.getAllAppsAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(toCamel));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createApp = async (req, res) => {
  try {
    const { name, tagline, description, whatsNew, category, tags, platform, version, minOSVersion } = req.body;

    if (!name || !tagline || !description || !category) {
      return res.status(400).json({ message: 'Name, tagline, description, and category are required' });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const { data: existing } = await supabase.from('apps').select('id').eq('slug', slug).single();
    if (existing) slug = `${slug}-${Date.now()}`;

    const appData = {
      name, slug, tagline, description,
      whats_new: whatsNew || '',
      category, platform: platform || 'android',
      version: version || '1.0.0',
      min_os_version: minOSVersion || '',
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : [],
      // Accept direct URLs from frontend
      icon: req.body.icon || '',
      screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : (req.body.screenshots ? JSON.parse(req.body.screenshots) : []),
      apk_file: req.body.apkFile || '',
      video_url: req.body.videoUrl || null,
      size: req.body.size || '0 MB',
    };

    // Fallback for legacy Multer if still used
    if (req.files) {
      if (req.files.icon?.[0]) appData.icon = await uploadToStorage(req.files.icon[0], 'icons');
      if (req.files.screenshots) appData.screenshots = await Promise.all(req.files.screenshots.map(f => uploadToStorage(f, 'screenshots')));
      if (req.files.appFile?.[0]) {
        appData.apk_file = await uploadToStorage(req.files.appFile[0], 'apps');
        appData.size = `${(req.files.appFile[0].size / (1024 * 1024)).toFixed(1)} MB`;
      }
    }

    const { data, error } = await supabase.from('apps').insert(appData).select().single();
    if (error) throw error;

    res.status(201).json(toCamel(data));
  } catch (error) {
    console.error('Create app error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.updateApp = async (req, res) => {
  try {
    const { data: app, error: findErr } = await supabase
      .from('apps')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findErr || !app) return res.status(404).json({ message: 'App not found' });

    const { name, tagline, description, whatsNew, category, tags, platform, version, minOSVersion, rating } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (tagline) updates.tagline = tagline;
    if (description) updates.description = description;
    if (whatsNew !== undefined) updates.whats_new = whatsNew;
    if (category) updates.category = category;
    if (platform) updates.platform = platform;
    if (version) updates.version = version;
    if (minOSVersion !== undefined) updates.min_os_version = minOSVersion;
    if (rating !== undefined) updates.rating = parseFloat(rating);
    if (tags) {
      updates.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
    }

    // Handle new file uploads
    if (req.files) {
      if (req.files.icon?.[0]) {
        await deleteFromStorage(app.icon);
        updates.icon = await uploadToStorage(req.files.icon[0], 'icons');
      }
      if (req.files.screenshots?.length > 0) {
        for (const ss of (app.screenshots || [])) await deleteFromStorage(ss);
        updates.screenshots = await Promise.all(
          req.files.screenshots.map(f => uploadToStorage(f, 'screenshots'))
        );
      }
      if (req.files.appFile?.[0]) {
        await deleteFromStorage(app.apk_file);
        updates.apk_file = await uploadToStorage(req.files.appFile[0], 'apps');
        const sizeInMB = (req.files.appFile[0].size / (1024 * 1024)).toFixed(1);
        updates.size = `${sizeInMB} MB`;
      }
    }

    const { data, error } = await supabase.from('apps').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;

    res.json(toCamel(data));
  } catch (error) {
    console.error('Update app error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.deleteApp = async (req, res) => {
  try {
    const { data: app, error: findErr } = await supabase
      .from('apps')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findErr || !app) return res.status(404).json({ message: 'App not found' });

    // Delete files from Supabase Storage
    await deleteFromStorage(app.icon);
    await deleteFromStorage(app.apk_file);
    for (const ss of (app.screenshots || [])) await deleteFromStorage(ss);

    const { error } = await supabase.from('apps').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const { data: app } = await supabase.from('apps').select('published').eq('id', req.params.id).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('apps')
      .update({ published: !app.published, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(data));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const { data: app } = await supabase.from('apps').select('featured').eq('id', req.params.id).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('apps')
      .update({ featured: !app.featured, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(data));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
