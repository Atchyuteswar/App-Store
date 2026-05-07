const supabase = require('../lib/supabase');
const slugify = require('slugify');
const { uploadToStorage, deleteFromStorage } = require('../middleware/uploadMiddleware');
const { sendConfirmationEmail } = require('../lib/mailer');
const { success, error, notFound, badRequest, toCamel } = require('../lib/utils');



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

    const { data, error: fetchError } = await query.order('created_at', { ascending: false });
    if (fetchError) throw fetchError;

    return success(res, data.map(toCamel));
  } catch (err) {
    console.error('Get apps error:', err);
    return error(res, 'Server error fetching apps');
  }
};

exports.getAppBySlug = async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();

    if (fetchError || !data) return notFound(res, 'App not found');
    return success(res, toCamel(data));
  } catch (err) {
    console.error('getAppBySlug error:', err);
    return error(res, 'Server error');
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
      screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : (typeof req.body.screenshots === 'string' ? JSON.parse(req.body.screenshots) : []),
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

    // Handle direct URLs from frontend
    if (req.body.icon) updates.icon = req.body.icon;
    if (req.body.screenshots) {
      updates.screenshots = Array.isArray(req.body.screenshots) 
        ? req.body.screenshots 
        : (typeof req.body.screenshots === 'string' ? JSON.parse(req.body.screenshots) : []);
    }
    if (req.body.apkFile) updates.apk_file = req.body.apkFile;
    if (req.body.videoUrl) updates.video_url = req.body.videoUrl;
    if (req.body.size) updates.size = req.body.size;

    // Handle new file uploads (Multer legacy)
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

exports.releaseAppUpdate = async (req, res) => {
  try {
    const { data: app, error: findErr } = await supabase
      .from('apps')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findErr || !app) return res.status(404).json({ message: 'App not found' });

    const { version, whatsNew, apkFile, size } = req.body;

    if (!version || !apkFile) {
      return res.status(400).json({ message: 'Version and APK file are required for a release' });
    }

    // 1. Create a history record for the CURRENT version before overwriting it
    const historyEntry = {
      version: app.version,
      whatsNew: app.whats_new,
      apkFile: app.apk_file,
      size: app.size,
      date: app.updated_at || app.created_at
    };

    const newHistory = [historyEntry, ...(app.version_history || [])];

    // 2. Prepare the updates for the NEW version
    const updates = {
      updated_at: new Date().toISOString(),
      version: version,
      whats_new: whatsNew || '',
      apk_file: apkFile,
      size: size || '0 MB',
      version_history: newHistory
    };

    const { data, error } = await supabase
      .from('apps')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(toCamel(data));
  } catch (error) {
    console.error('Release update error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.rollbackAppUpdate = async (req, res) => {
  try {
    const { historyIndex } = req.body;
    
    if (historyIndex === undefined || historyIndex === null) {
      return res.status(400).json({ message: 'History index is required' });
    }

    const { data: app, error: findErr } = await supabase
      .from('apps')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findErr || !app) return res.status(404).json({ message: 'App not found' });

    const historyArray = app.version_history || [];
    const targetHistory = historyArray[historyIndex];

    if (!targetHistory) {
      return res.status(404).json({ message: 'Version history entry not found' });
    }

    // 1. Create a history record for the CURRENT buggy version
    const currentAsHistory = {
      version: app.version,
      whatsNew: app.whats_new,
      apkFile: app.apk_file,
      size: app.size,
      date: new Date().toISOString()
    };

    // 2. Remove the target history entry, and add the current version to history
    const newHistory = historyArray.filter((_, idx) => idx !== parseInt(historyIndex));
    newHistory.unshift(currentAsHistory);

    // 3. Promote the target history entry to the active fields
    const updates = {
      updated_at: new Date().toISOString(),
      version: targetHistory.version,
      whats_new: targetHistory.whatsNew || '',
      apk_file: targetHistory.apkFile,
      size: targetHistory.size || '0 MB',
      version_history: newHistory
    };

    const { data, error } = await supabase
      .from('apps')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(toCamel(data));
  } catch (error) {
    console.error('Rollback app error:', error);
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

exports.toggleAbTesting = async (req, res) => {
  try {
    const { data: app } = await supabase.from('apps').select('ab_testing_enabled').eq('id', req.params.id).single();
    if (!app) return res.status(404).json({ message: 'App not found' });

    const { data, error } = await supabase
      .from('apps')
      .update({ ab_testing_enabled: !app.ab_testing_enabled, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(toCamel(data));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.enrollAbTesting = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    if (!fullName || !phoneNumber) {
      return res.status(400).json({ message: 'Full name and phone number are required' });
    }

    if (!req.user || req.user.role !== 'user') {
       return res.status(403).json({ message: 'Only registered users can enroll in testing' });
    }

    const { data: app } = await supabase.from('apps').select('id, name, ab_testing_enabled').eq('slug', req.params.slug).single();
    if (!app || !app.ab_testing_enabled) {
      return res.status(400).json({ message: 'A/B Testing is not enabled for this app' });
    }

    const { data: enrollment, error } = await supabase.from('ab_test_enrollments').insert({
      user_id: req.user.id,
      app_id: app.id,
      full_name: fullName,
      phone_number: phoneNumber,
    }).select().single();

    if (error) {
      if (error.code === '23505') { 
        return res.status(400).json({ message: 'You are already enrolled in this testing program' });
      }
      throw error;
    }

    if (req.user.email) {
      sendConfirmationEmail(req.user.email, fullName, app.name).catch(console.error);
    }

    res.status(201).json({ message: 'Successfully enrolled', enrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
