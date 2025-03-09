import jwt from 'jsonwebtoken';
import { users_db } from '../db/conn.mjs';
import { ObjectId } from 'mongodb';
import { USER_ROLES } from '../utils/constant.mjs';

export const verifyToken = async (req, res, next) => {
  try {
    console.log('Authorization header:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    if (!decoded.id || !decoded.accountType) {
      console.log('Invalid token payload:', decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      accountType: decoded.accountType
    };
    console.log('User set in request:', req.user);
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  // console.log('Checking admin access for user:', req.user);
  if (!req.user) {
    console.log('No user in request');
    return res.status(403).json({ message: 'User not authenticated' });
  }
  if (req.user.accountType == USER_ROLES) { // 1 is user account type
    console.log('User is not admin or not vendor. Account type:', req.user.accountType);
    return res.status(403).json({ message: 'Admin or vendor access required' });
  }
  // console.log('Admin access granted');
  next();
};
