import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0
    },
    compareAtPrice: {
      type: Number,
      default: 0
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    brand: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
      ]
    },
    stock: {
      type: Number,
      required: [true, 'Please specify inventory count'],
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    attributes: [
      {
        key: { type: String },
        value: { type: String }
      }
    ],
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// MongoDB Text Index for fallback search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });

export default mongoose.model('Product', productSchema);

