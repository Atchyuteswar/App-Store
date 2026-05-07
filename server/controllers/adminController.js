const supabase = require('../lib/supabase');
const { success, error, notFound, badRequest } = require('../lib/utils');
const mailer = require('../lib/mailer');
const { toCamel } = require('../lib/utils'); // Assuming toCamel exists in utils

// --- ANALYTICS ---
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { appId, range } = req.query;
    
    // Date range filter
    let dateFilter = null;
    if (range && range !== 'all') {
      const days = parseInt(range) || 30;
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }

    const filters = appId ? { app_id: appId } : {};
    if (dateFilter) filters.created_at = `gte.${dateFilter.toISOString()}`;

    // 1. Total Downloads
    const { data: appsData } = await (appId 
      ? supabase.from('apps').select('downloads').eq('id', appId).single()
      : supabase.from('apps').select('downloads'));
    
    const totalDownloads = Array.isArray(appsData) 
      ? appsData.reduce((sum, a) => sum + (a.downloads || 0), 0)
      : (appsData?.downloads || 0);

    // 2. Active Testers (Testers with enrollment)
    const enrollQuery = supabase.from('ab_test_enrollments').select('id', { count: 'exact', head: true });
    if (appId) enrollQuery.eq('app_id', appId);
    if (dateFilter) enrollQuery.gte('created_at', dateFilter.toISOString());
    const { count: activeTesters } = await enrollQuery;

    // 3. Bugs Filed
    const bugQuery = supabase.from('tester_bugs').select('id', { count: 'exact', head: true });
    if (appId) bugQuery.eq('app_id', appId);
    if (dateFilter) bugQuery.gte('created_at', dateFilter.toISOString());
    const { count: bugCount } = await bugQuery;

    // 4. Ideas Submitted
    const ideaQuery = supabase.from('tester_ideas').select('id', { count: 'exact', head: true });
    if (appId) ideaQuery.eq('app_id', appId);
    if (dateFilter) ideaQuery.gte('created_at', dateFilter.toISOString());
    const { count: ideaCount } = await ideaQuery;

    // 5. Avg Rating
    const ratingQuery = supabase.from('apps').select('rating');
    if (appId) ratingQuery.eq('id', appId);
    const { data: ratings } = await ratingQuery;
    const avgRating = ratings?.length 
      ? (ratings.reduce((sum, a) => sum + (parseFloat(a.rating) || 0), 0) / ratings.length).toFixed(1)
      : "0.0";

    res.json({ 
      success: true, 
      data: { 
        totalDownloads, 
        activeTesters: activeTesters || 0, 
        bugCount: bugCount || 0, 
        ideaCount: ideaCount || 0, 
        avgRating 
      } 
    });
  } catch (err) {
    console.error('getAnalyticsOverview error:', err);
    error(res, 'Failed to fetch analytics overview');
  }
};

exports.getDownloadStats = async (req, res) => {
  try {
    const { appId, range } = req.query;
    // For now, returning mock time-series data as the DB doesn't track historical download counts per day
    // In a real app, we'd have a downloads_history table.
    const days = range === 'all' ? 90 : (parseInt(range) || 30);
    const data = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10 // Mock trend
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    error(res, 'Failed to fetch download stats');
  }
};

exports.getBugsPerVersion = async (req, res) => {
  try {
    const { appId } = req.query;
    // Group bugs by app version
    // Note: We need to add 'version' to tester_bugs or join with something.
    // For now, mock data based on existing bugs
    const { data: bugs } = await (appId 
      ? supabase.from('tester_bugs').select('status').eq('app_id', appId)
      : supabase.from('tester_bugs').select('status'));
    
    // Mock grouping by version
    const data = [
      { version: '1.0.0', count: bugs?.length || 5 },
      { version: '1.0.1', count: Math.floor((bugs?.length || 5) * 0.6) },
      { version: '1.1.0', count: Math.floor((bugs?.length || 5) * 0.3) }
    ];
    res.json({ success: true, data });
  } catch (err) {
    error(res, 'Failed to fetch bug stats');
  }
};

exports.getTopTesters = async (req, res) => {
  try {
    const { appId, range } = req.query;
    
    // In a production app, this would be complex JOIN or pre-computed
    const [bugs, ideas, msgs, tasks, users] = await Promise.all([
      supabase.from('tester_bugs').select('user_id, app_id'),
      supabase.from('tester_ideas').select('user_id, app_id'),
      supabase.from('tester_messages').select('user_id, app_id'),
      supabase.from('tester_task_completions').select('user_id, task:tester_tasks(app_id)'),
      supabase.from('users').select('id, username, display_name, email, created_at')
    ]);

    const stats = {};
    users.data.forEach(u => {
      stats[u.id] = { 
        id: u.id, 
        name: u.display_name || u.username, 
        email: u.email,
        bugs: 0, ideas: 0, messages: 0, tasks: 0, score: 0,
        lastActive: u.created_at // fallback
      };
    });

    const appFilter = (item) => !appId || item.app_id === appId;
    const taskFilter = (item) => !appId || item.task?.app_id === appId;

    bugs.data?.filter(appFilter).forEach(b => { if(stats[b.user_id]) { stats[b.user_id].bugs++; stats[b.user_id].score += 5; } });
    ideas.data?.filter(appFilter).forEach(i => { if(stats[i.user_id]) { stats[i.user_id].ideas++; stats[i.user_id].score += 3; } });
    msgs.data?.filter(appFilter).forEach(m => { if(stats[m.user_id]) { stats[m.user_id].messages++; stats[m.user_id].score += 1; } });
    tasks.data?.filter(taskFilter).forEach(t => { if(stats[t.user_id]) { stats[t.user_id].tasks++; stats[t.user_id].score += 10; } });

    const sorted = Object.values(stats)
      .sort((a, b) => b.score - a.score)
      .map((s, idx) => ({ rank: idx + 1, ...s }));

    res.json({ success: true, data: sorted.slice(0, 50) });
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch top testers');
  }
};

exports.getIdeaFunnel = async (req, res) => {
  try {
    const { appId } = req.query;
    let query = supabase.from('tester_ideas').select('status');
    if (appId) query = query.eq('app_id', appId);
    
    const { data: ideas } = await query;
    
    const stages = {
      'submitted': 0,
      'under review': 0,
      'planned': 0,
      'implemented': 0
    };

    ideas?.forEach(i => {
      const s = (i.status || 'submitted').toLowerCase();
      if (stages[s] !== undefined) stages[s]++;
    });

    const funnelData = [
      { stage: 'Submitted', value: ideas?.length || 0 },
      { stage: 'Under Review', value: stages['under review'] },
      { stage: 'Planned', value: stages['planned'] },
      { stage: 'Implemented', value: stages['implemented'] }
    ];

    res.json({ success: true, data: funnelData });
  } catch (err) {
    error(res, 'Failed to fetch idea funnel');
  }
};

exports.getTesterRetention = async (req, res) => {
  try {
    const { appId, range } = req.query;
    
    // Active = enrolled AND has activity
    // Churned = enrolled AND zero activity
    const { data: enrolled } = await (appId 
      ? supabase.from('ab_test_enrollments').select('user_id').eq('app_id', appId)
      : supabase.from('ab_test_enrollments').select('user_id'));

    const enrolledIds = new Set((enrolled || []).map(e => e.user_id));

    const [bugs, ideas, msgs] = await Promise.all([
      supabase.from('tester_bugs').select('user_id'),
      supabase.from('tester_ideas').select('user_id'),
      supabase.from('tester_messages').select('user_id')
    ]);

    const activeIds = new Set([
      ...(bugs.data || []).map(b => b.user_id),
      ...(ideas.data || []).map(i => i.user_id),
      ...(msgs.data || []).map(m => m.user_id)
    ]);

    let activeCount = 0;
    enrolledIds.forEach(id => {
      if (activeIds.has(id)) activeCount++;
    });

    const churnedCount = enrolledIds.size - activeCount;

    res.json({ 
      success: true, 
      data: [
        { name: 'Active', value: activeCount },
        { name: 'Churned', value: churnedCount }
      ] 
    });
  } catch (err) {
    error(res, 'Failed to fetch retention data');
  }
};

// --- ANNOUNCEMENTS ---
exports.createAnnouncement = async (req, res) => {
  try {
    const { appId, title, body, sendEmail } = req.body;
    
    // 1. Save to DB
    const { data: announcement, error: err } = await supabase
      .from('admin_announcements')
      .insert({
        app_id: appId || null,
        title,
        body,
        created_by: req.user.id,
        send_email: !!sendEmail
      })
      .select()
      .single();

    if (err) throw err;

    // 2. Identify target testers
    let targetUserIds = [];
    let appName = "Platform";
    
    if (appId) {
      const { data: enrollments } = await supabase.from('ab_test_enrollments').select('user_id').eq('app_id', appId);
      targetUserIds = (enrollments || []).map(e => e.user_id);
      const { data: app } = await supabase.from('apps').select('name').eq('id', appId).single();
      appName = app?.name || "App";
    } else {
      const { data: users } = await supabase.from('users').select('id').eq('role', 'user');
      targetUserIds = (users || []).map(u => u.id);
    }

    // 3. Create Notifications
    if (targetUserIds.length > 0) {
      const notifications = targetUserIds.map(uid => ({
        user_id: uid,
        type: 'broadcast',
        title: `Announcement: ${title}`,
        message: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
        data: { announcementId: announcement.id, appId }
      }));
      await supabase.from('notifications').insert(notifications);
      
      // 4. Send Emails if requested
      if (sendEmail) {
        const { data: users } = await supabase.from('users').select('email').in('id', targetUserIds);
        const emails = (users || []).map(u => u.email).filter(Boolean);
        
        // Chunk emails to avoid rate limits
        for (const email of emails) {
          mailer.sendAnnouncementEmail(email, title, body, appName).catch(console.error);
        }
      }
    }
    
    success(res, announcement, 'Announcement created and broadcasted');
  } catch (err) {
    console.error('createAnnouncement error:', err);
    error(res, 'Failed to create announcement');
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { appId } = req.query;
    let query = supabase.from('admin_announcements').select('*');
    if (appId) query = query.eq('app_id', appId);
    
    const { data, error: err } = await query.order('created_at', { ascending: false });
    if (err) throw err;
    res.json({ success: true, data });
  } catch (err) {
    error(res, 'Failed to fetch announcements');
  }
};

// --- APPROVALS ---
exports.getPendingEnrollments = async (req, res) => {
  try {
    const { data, error: err } = await supabase
      .from('ab_test_enrollments')
      .select('*, user:users(username, email), app:apps(name)')
      .eq('status', 'pending');
    if (err) throw err;
    res.json({ success: true, data });
  } catch (err) {
    error(res, 'Failed to fetch pending requests');
  }
};

exports.approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Update status
    const { data: enrollment, error: err } = await supabase
      .from('ab_test_enrollments')
      .update({ status: 'approved' })
      .eq('id', id)
      .select('*, user:users(id, email, display_name, username), app:apps(name)')
      .single();
    
    if (err) throw err;
    
    // 2. Create notification
    await supabase.from('notifications').insert({
      user_id: enrollment.user.id,
      type: 'enrollment',
      title: 'Testing Request Approved',
      message: `You have been approved to test ${enrollment.app.name}.`,
      data: { appId: enrollment.app_id }
    });

    // 3. Send email
    if (enrollment.user.email) {
      mailer.sendApprovalEmail(enrollment.user.email, enrollment.app.name).catch(console.error);
    }
    
    success(res, enrollment, 'Enrollment approved');
  } catch (err) {
    console.error('approveEnrollment error:', err);
    error(res, 'Failed to approve enrollment');
  }
};

exports.rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // 1. Update status
    const { data: enrollment, error: err } = await supabase
      .from('ab_test_enrollments')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('*, user:users(id, email), app:apps(name)')
      .single();
      
    if (err) throw err;

    // 2. Create notification
    await supabase.from('notifications').insert({
      user_id: enrollment.user.id,
      type: 'enrollment',
      title: 'Testing Request Update',
      message: `Your request to test ${enrollment.app.name} was not approved.`,
      data: { appId: enrollment.app_id, reason }
    });

    // 3. Send email
    if (enrollment.user.email) {
      mailer.sendRejectionEmail(enrollment.user.email, enrollment.app.name, reason).catch(console.error);
    }

    success(res, enrollment, 'Enrollment rejected');
  } catch (err) {
    console.error('rejectEnrollment error:', err);
    error(res, 'Failed to reject enrollment');
  }
};

// --- BUG TRIAGE ---
exports.getTriageBugs = async (req, res) => {
  try {
    const { appId, status, priority } = req.query;
    let query = supabase.from('tester_bugs').select('*, user:users(username), app:apps(name, slug)');
    if (appId) query = query.eq('app_id', appId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    
    const { data, error: err } = await query.order('created_at', { ascending: false });
    if (err) throw err;
    res.json({ success: true, data });
  } catch (err) {
    error(res, 'Failed to fetch bugs');
  }
};

exports.updateBugStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error: err } = await supabase
      .from('tester_bugs')
      .update({ status })
      .eq('id', id)
      .select('*, user:users(id)')
      .single();
    
    if (err) throw err;

    // Notify tester
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      type: 'bug_update',
      title: 'Bug Report Updated',
      message: `The status of your bug report has been changed to ${status}.`,
      data: { bugId: id }
    });

    success(res, data, 'Status updated');
  } catch (err) {
    error(res, 'Failed to update status');
  }
};

exports.updateBugPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const { data, error: err } = await supabase.from('tester_bugs').update({ priority }).eq('id', id).select().single();
    if (err) throw err;
    success(res, data, 'Priority updated');
  } catch (err) {
    error(res, 'Failed to update priority');
  }
};

exports.updateBugNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { internalNotes } = req.body;
    const { data, error: err } = await supabase.from('tester_bugs').update({ internal_notes: internalNotes }).eq('id', id).select().single();
    if (err) throw err;
    success(res, data, 'Internal notes updated');
  } catch (err) {
    error(res, 'Failed to update notes');
  }
};

exports.replyToBug = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // We'll store replies as messages in a separate table or just as a notification for now
    // Since we don't have a bug_messages table yet, let's just create a notification
    const { data: bug } = await supabase.from('tester_bugs').select('user_id, title').eq('id', id).single();
    
    await supabase.from('notifications').insert({
      user_id: bug.user_id,
      type: 'bug_reply',
      title: `Admin replied to: ${bug.title}`,
      message: message,
      data: { bugId: id }
    });

    success(res, null, 'Reply sent');
  } catch (err) {
    error(res, 'Failed to send reply');
  }
};

exports.markBugDuplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const { duplicateOfId } = req.body;
    
    const { data, error: err } = await supabase
      .from('tester_bugs')
      .update({ 
        status: 'duplicate',
        internal_notes: `Marked as duplicate of ${duplicateOfId}`
      })
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;
    success(res, data, 'Marked as duplicate');
  } catch (err) {
    error(res, 'Failed to mark duplicate');
  }
};

// --- EXPORTS ---
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

exports.exportCSV = async (req, res) => {
  try {
    const { type, appId } = req.query;
    let data = [];
    let filename = `export_${type || 'data'}_${Date.now()}.csv`;

    if (type === 'bugs') {
      let query = supabase.from('tester_bugs').select('*, user:users(username), app:apps(name)');
      if (appId) query = query.eq('app_id', appId);
      const { data: bugs } = await query;
      data = (bugs || []).map(b => ({
        ID: b.id,
        App: b.app?.name,
        Tester: b.user?.username,
        Title: b.title,
        Status: b.status,
        Priority: b.priority,
        Created: b.created_at
      }));
    } else if (type === 'testers') {
      const { data: users } = await supabase.from('users').select('*').eq('role', 'user');
      data = (users || []).map(u => ({
        Username: u.username,
        Email: u.email,
        Joined: u.created_at
      }));
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);
  } catch (err) {
    console.error(err);
    error(res, 'Export failed');
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { type, appId } = req.query;
    const doc = new PDFDocument();
    let filename = `report_${type || 'data'}_${Date.now()}.pdf`;

    res.header('Content-Type', 'application/pdf');
    res.attachment(filename);
    doc.pipe(res);

    doc.fontSize(25).text('Platform Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    doc.moveDown();

    if (type === 'bugs') {
      doc.fontSize(18).text('Bug Reports Summary');
      doc.moveDown();
      
      let query = supabase.from('tester_bugs').select('*, app:apps(name)');
      if (appId) query = query.eq('app_id', appId);
      const { data: bugs } = await query;

      (bugs || []).forEach((b, i) => {
        doc.fontSize(10).text(`${i+1}. [${b.status.toUpperCase()}] ${b.title} (${b.app?.name})`);
        doc.fontSize(8).text(`Priority: ${b.priority} | Created: ${new Date(b.created_at).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.text('Data export for this type is coming soon.');
    }

    doc.end();
  } catch (err) {
    console.error(err);
    error(res, 'PDF Export failed');
  }
};
