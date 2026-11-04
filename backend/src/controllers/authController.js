import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  saveCredentialRecord,
  findCredentialUserByEmail
} from '../services/credentialLogger.js';

// Send token response with cookie/json
const sendTokenResponse = (user, statusCode, res) => {
  const token = typeof user.getSignedJwtToken === 'function'
    ? user.getSignedJwtToken()
    : jwt.sign(
        { id: user._id || user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'super_secret_jwt_token_for_assessment_fs01_2026',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || {},
      vendorProfile: user.vendorProfile
    }
  });
};

// @desc    Register user (Customer, Vendor, or Admin)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer', storeName, storeDescription, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check credentials JSON first
    const existingCred = findCredentialUserByEmail(email);
    if (existingCred) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // 1. Immediately persist registered credentials in root credentials/*.json
    saveCredentialRecord({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '',
      storeName: role === 'vendor' ? storeName : undefined
    });

    // 2. Also attempt MongoDB save if database is running
    let user = null;
    try {
      const userData = {
        name,
        email,
        password,
        role: role || 'customer',
        phone: phone || ''
      };

      if (role === 'vendor') {
        userData.vendorProfile = {
          storeName: storeName || `${name}'s Store`,
          slug: (storeName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: storeDescription || 'Welcome to our verified marketplace store!',
          commissionRate: Number(process.env.DEFAULT_COMMISSION_PERCENTAGE || 10),
          isApproved: true
        };
      }

      user = await User.create(userData);
    } catch (dbErr) {
      console.warn('[Auth] MongoDB write skipped, using credentials store:', dbErr.message);
    }

    // Fallback in-memory user if Mongo is offline
    if (!user) {
      user = {
        _id: 'usr_' + Buffer.from(email).toString('hex').slice(0, 24),
        name,
        email,
        role: role || 'customer',
        phone: phone || '',
        vendorProfile: role === 'vendor' ? {
          storeName: storeName || `${name}'s Store`,
          slug: (storeName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: storeDescription || 'Welcome to our verified marketplace store!',
          isApproved: true
        } : undefined
      };
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user (Authenticates via credentials/*.json and MongoDB)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // 1. Check credentials/*.json file store directly
    const credUser = findCredentialUserByEmail(email);
    if (credUser) {
      if (String(credUser.password) === String(password)) {
        let user = null;
        try {
          user = await User.findOne({ email }).select('+password');
          if (!user) {
            user = await User.create({
              name: credUser.name,
              email: credUser.email,
              password: credUser.password,
              role: credUser.role || 'customer',
              phone: credUser.phone || '',
              vendorProfile: credUser.role === 'vendor' ? {
                storeName: credUser.storeName || `${credUser.name}'s Store`,
                slug: (credUser.storeName || credUser.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: 'Verified Merchant Store',
                isApproved: true
              } : undefined
            });
          }
        } catch (dbErr) {
          // Mongo offline - proceed with synthesized user
        }

        if (!user) {
          user = {
            _id: credUser.id || 'usr_' + Buffer.from(credUser.email).toString('hex').slice(0, 24),
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

        return sendTokenResponse(user, 200, res);
      }
    }

    // 2. Check MongoDB directly if not found in credentials or password differed
    try {
      const user = await User.findOne({ email }).select('+password');
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          return sendTokenResponse(user, 200, res);
        }
      }
    } catch (dbErr) {
      // Mongo offline
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check email and password.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    let user = null;
    try {
      user = await User.findById(req.user.id || req.user._id);
    } catch (e) {
      // ignore
    }
    res.status(200).json({
      success: true,
      user: user || req.user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

