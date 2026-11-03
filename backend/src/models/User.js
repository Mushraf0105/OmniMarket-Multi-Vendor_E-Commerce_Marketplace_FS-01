import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' }
    },
    vendorProfile: {
      storeName: { type: String, trim: true },
      slug: { type: String, lowercase: true },
      description: { type: String },
      banner: { type: String, default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
      logo: { type: String, default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80' },
      commissionRate: { type: Number, default: 10 }, // platform commission %
      isApproved: { type: Boolean, default: true },
      bankDetails: {
        accountHolder: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        routingOrIfsc: { type: String, default: '' },
        bankName: { type: String, default: '' }
      },
      stripeAccountId: { type: String, default: '' },
      razorpayAccountId: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET || 'super_secret_jwt_token_for_assessment_fs01_2026',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

