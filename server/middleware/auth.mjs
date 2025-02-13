import jwt from 'jsonwebtoken';
import { users_db } from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await users_db.collection('customer_info').findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(), // Convert ObjectId to string
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
