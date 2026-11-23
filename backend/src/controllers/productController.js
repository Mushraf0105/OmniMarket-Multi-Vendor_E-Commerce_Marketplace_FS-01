import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { searchProducts } from '../services/searchService.js';
import { indexProductInES, deleteProductFromES } from '../config/elasticsearch.js';
import { uploadFile } from '../config/s3.js';

// @desc    Get products with search, filters, and sorting (Elasticsearch / Mongo)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const result = await searchProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    if (mongoose.connection?.readyState !== 1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { idOrSlug } = req.params;
    let query;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: idOrSlug };
    } else {
      query = { slug: idOrSlug };
    }

    const product = await Product.findOne(query).populate('vendor', 'name email vendorProfile');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name slug price images rating numReviews brand');

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor / Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      brand,
      stock,
      images,
      tags,
      attributes
    } = req.body;

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      category,
      brand: brand || '',
      stock: Number(stock),
      images: images && images.length > 0 ? images : undefined,
      tags: tags || [],
      attributes: attributes || [],
      vendor: req.user.id
    });

    // Populate vendor info for Elasticsearch indexing
    await product.populate('vendor', 'name vendorProfile');
    await indexProductInES(product);

    res.status(201).json({
      success: true,
      message: 'Product created and indexed successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor / Admin)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership if not admin
    if (req.user.role !== 'admin' && product.vendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product.'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('vendor', 'name vendorProfile');

    await indexProductInES(product);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor / Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership if not admin
    if (req.user.role !== 'admin' && product.vendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    await deleteProductFromES(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted from database and search index.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload product image to S3 (or local disk fallback)
// @route   POST /api/products/upload-image
// @access  Private (Vendor / Admin)
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = await uploadFile(req.file);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories with active product counts
// @route   GET /api/products/categories/all
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection?.readyState !== 1) {
      const defaultCategories = [
        { name: 'Electronics', slug: 'electronics', description: 'Gadgets, audio, and high-tech devices', productCount: 0 },
        { name: 'Fashion & Apparel', slug: 'fashion-apparel', description: 'Designer clothing, footwear, and accessories', productCount: 0 },
        { name: 'Home & Living', slug: 'home-living', description: 'Modern decor, kitchen essentials, and sustainable furniture', productCount: 0 },
        { name: 'Books & Stationery', slug: 'books-stationery', description: 'Bestselling literature, notebooks, and writing instruments', productCount: 0 },
        { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Athletic apparel, gym equipment, and outdoor adventure gear', productCount: 0 }
      ];
      return res.status(200).json({
        success: true,
        categories: defaultCategories
      });
    }

    const categories = await Category.find({ isActive: true });
    
    // Aggregate product counts per category
    const counts = await Product.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map((c) => [c._id, c.count]));

    const result = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      productCount: countMap.get(cat.name) || 0
    }));

    res.status(200).json({
      success: true,
      categories: result
    });
  } catch (err) {
    next(err);
  }
};

