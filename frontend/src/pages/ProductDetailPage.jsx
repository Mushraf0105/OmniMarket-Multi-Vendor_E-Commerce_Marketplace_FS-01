import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Check,
  Store,
  Shield,
  Truck,
  RotateCcw,
  Star,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [added, setAdded] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${idOrSlug}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setActiveImage(res.data.product.images?.[0] || '');
          setRelatedProducts(res.data.relatedProducts || []);
          fetchReviews(res.data.product._id);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  const fetchReviews = async (pId) => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/reviews/product/${pId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    const res = await addToCart(product._id, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      const res = await api.post('/reviews', {
        productId: product._id,
        rating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your verified review has been submitted.');
        setReviewTitle('');
        setReviewComment('');
        fetchReviews(product._id);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/search" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const vendorName = product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Verified Vendor';
  const vendorId = product.vendor?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-amber-500 shadow' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Vendor info pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {product.category}
              </span>

              {vendorId && (
                <Link
                  to={`/vendor/${vendorId}`}
                  className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full transition-colors"
                >
                  <Store size={14} className="mr-1.5" />
                  <span>Store: {vendorName}</span>
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center space-x-3">
              <RatingStars rating={product.rating} numReviews={product.numReviews} size={18} />
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-600 font-medium">
                Brand: <strong className="text-slate-900">{product.brand || 'Original Brand'}</strong>
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                {product.compareAtPrice > product.price && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Save ₹{(product.compareAtPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Split payment transparently distributed between vendor and marketplace.
              </p>
            </div>

            {/* Description */}
            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <p>{product.description}</p>
            </div>

            {/* Stock indicator */}
            <div>
              <span
                className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stock > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Currently Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector and Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900 active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Redis Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 px-6 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow disabled:opacity-50"
              >
                Buy Now (Instant Checkout)
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500">
              <div className="flex flex-col items-center">
                <Shield size={18} className="text-amber-600 mb-1" />
                <span>Buyer Protection</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck size={18} className="text-amber-600 mb-1" />
                <span>Fast Dispatched</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw size={18} className="text-amber-600 mb-1" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <MessageSquare size={20} className="mr-2 text-amber-500" />
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback from buyers of {product.name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">{product.rating.toFixed(1)}</span>
            <div className="text-xs text-slate-500">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                  />
                ))}
              </div>
              <span>out of 5 stars</span>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 mb-2">Write a Customer Review</h3>
          {reviewSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg mb-3 flex items-center">
              <Check size={16} className="mr-2 shrink-0" />
              <span>{reviewSuccess}</span>
            </div>
          )}
          {reviewError && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg mb-3 flex items-center">
              <AlertCircle size={16} className="mr-2 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Overall Rating</label>
              <RatingStars rating={rating} size={22} interactive={true} onRatingChange={setRating} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
              <input
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="What is most important to know?"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Review</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your review here... How was the quality, shipping, and seller service?"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-2 px-5 rounded-lg transition-colors shadow"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <p className="text-xs text-slate-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <RatingStars rating={rev.rating} size={14} />

                {rev.title && (
                  <h4 className="font-semibold text-xs text-slate-800">{rev.title}</h4>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Related Products in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;

