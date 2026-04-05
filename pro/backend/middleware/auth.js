import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    
    // Convert string userId to ObjectId for MongoDB query
    const userId = new ObjectId(decoded.userId);
    const user = await db.collection('users').findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { 
      id: user._id.toString(),
      userId: user._id.toString(), // Add userId for backward compatibility
      email: user.email, 
      role: user.role 
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
