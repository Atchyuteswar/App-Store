const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in Cookie or Authorization Header
    let token = req.cookies?.token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'admin' || !decoded.role) {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, username, email, created_at')
        .eq('id', decoded.id)
        .single();

      if (error || !admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      req.admin = admin;
      req.user = { ...admin, role: 'admin' };
    } else {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, created_at')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = { ...user, role: 'user' };
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
