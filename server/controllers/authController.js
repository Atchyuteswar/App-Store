const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  if (req.admin) {
    res.json({ admin: req.admin });
  } else if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

exports.userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email: email.toLowerCase(),
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error || !user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: 'user' },
    });
  } catch (error) {
    console.error('User Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: 'user' },
    });
  } catch (error) {
    console.error('User Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

