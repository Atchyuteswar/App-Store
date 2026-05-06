const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { success, error, unauthorized, badRequest } = require('../lib/utils');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'Email and password are required');

    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !admin) return unauthorized(res, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return unauthorized(res, 'Invalid credentials');

    const token = generateToken({ id: admin.id, role: 'admin' });
    res.cookie('token', token, cookieOptions);

    return success(res, {
      token,
      user: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error('Admin Login error:', err);
    return error(res, 'Server error during login');
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  return success(res, null, 'Logged out successfully');
};

exports.me = async (req, res) => {
  if (req.user) return success(res, req.user);
  return unauthorized(res, 'Not authenticated');
};

exports.userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return badRequest(res, 'All fields are required');
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (existingUser) return badRequest(res, 'Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        username,
        email: email.toLowerCase(),
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (insertError || !user) return error(res, 'Failed to create user');

    const token = generateToken({ id: user.id, role: 'user' });
    res.cookie('token', token, cookieOptions);

    return success(res, {
      token,
      user: { ...user, role: 'user' },
    }, 'Account created successfully', 201);
  } catch (err) {
    console.error('User Signup error:', err);
    return error(res, 'Server error during signup');
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'Email and password are required');

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !user) return unauthorized(res, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return unauthorized(res, 'Invalid credentials');

    const token = generateToken({ id: user.id, role: 'user' });
    res.cookie('token', token, cookieOptions);

    return success(res, {
      token,
      user: { ...user, role: 'user' },
    });
  } catch (err) {
    console.error('User Login error:', err);
    return error(res, 'Server error during login');
  }
};

