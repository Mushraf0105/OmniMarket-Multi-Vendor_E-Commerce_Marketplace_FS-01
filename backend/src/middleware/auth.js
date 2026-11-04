import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { findCredentialUserByIdOrEmail } from '../services/credentialLogger.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_token_for_assessment_fs01_2026'
    );

    let user = null;
    try {
      user = await User.findById(decoded.id);
    } catch (e) {
      // Mongo offline or non-ObjectId
    }

    if (!user) {
      const credUser = findCredentialUserByIdOrEmail(decoded.email || decoded.id);
      if (credUser) {
        user = {
          _id: credUser.id || decoded.id || 'usr_' + Buffer.from(credUser.email).toString('hex').slice(0, 24),
          id: credUser.id || decoded.id || 'usr_' + Buffer.from(credUser.email).toString('hex').slice(0, 24),
          name: credUser.name,
          email: credUser.email,
          role: credUser.role || 'customer',
          phone: credUser.phone || '',
          vendorProfile: credUser.role === 'vendor' ? {
            storeName: credUser.storeName || `${credUser.name}'s Store`,
            isApproved: true
          } : undefined
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired.'
    });
  }
};

