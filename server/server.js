require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const supabase = require('./lib/supabase');
const appRoutes = require('./routes/appRoutes');
const { adminRouter } = require('./routes/appRoutes');
const authRoutes = require('./routes/authRoutes');
const testerRoutes = require('./routes/testerRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://appstore-atchyut.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/apps', appRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/tester', testerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Seed admin and start server
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Test Supabase connection
    const { error: testErr } = await supabase.from('admins').select('id').limit(1);
    if (testErr) throw new Error(`Supabase connection failed: ${testErr.message}`);
    console.log('Connected to Supabase');

    // Seed admin account if none exists
    const { data: admins } = await supabase.from('admins').select('id').limit(1);
    if (!admins || admins.length === 0) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      const { error } = await supabase.from('admins').insert({
        username: 'admin',
        email: process.env.ADMIN_EMAIL,
        password_hash: passwordHash,
      });
      if (error) throw error;
      console.log(`Admin account seeded: ${process.env.ADMIN_EMAIL}`);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

start();
