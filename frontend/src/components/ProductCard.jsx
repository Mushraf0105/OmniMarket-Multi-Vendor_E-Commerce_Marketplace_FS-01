import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Store } from 'lucide-react';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setLoading(true);
    const res = await addToCart(product._id, 1);
    setLoading(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const vendorName = product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Verified Vendor';
  const vendorId = product.vendor?._id || product.vendor;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      <Link to={`/product/${product.slug || product._id}`} className="block relative overflow-hidden bg-slate-50 pt-[80%]">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            -{discountPercent}%
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor store pill */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">{product.category}</span>
            {vendorId && (
              <Link
                to={`/vendor/${vendorId}`}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium truncate max-w-[120px]"
                title={vendorName}
              >
                <Store size={12} className="mr-1 inline-block shrink-0" />
                <span className="truncate">{vendorName}</span>
              </Link>
            )}
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            className="font-medium text-slate-800 hover:text-indigo-600 text-sm line-clamp-2 mb-1.5 transition-colors"
          >
            {product.name}
          </Link>

          <div className="mb-2">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size={14} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-medium ${product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
              {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || loading}
            aria-label="Add to cart"
            className={`p-2.5 rounded-lg font-medium text-xs flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900'
            }`}
          >
            {added ? (
              <Check size={18} className="animate-scale-in" />
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
