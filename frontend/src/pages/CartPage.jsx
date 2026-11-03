import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
  Store,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(couponInput.trim());
    setApplying(false);

    if (res.success) {
      setCouponSuccess(`Coupon '${res.coupon.code}' applied successfully!`);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const tax = Math.round((cart.subtotal - discountAmount) * 0.08 * 100) / 100;
  const shipping = cart.subtotal > 100 || cart.items.length === 0 ? 0 : 10;
  const grandTotal = Math.round((cart.subtotal - discountAmount + tax + shipping) * 100) / 100;

  // Group cart items by vendor for Amazon-style multi-vendor clarity
  const vendorGroups = cart.items.reduce((acc, item) => {
    const vId = item.vendor || 'unassigned';
    if (!acc[vId]) {
      acc[vId] = {
        vendorName: item.vendorName,
        items: []
      };
    }
    acc[vId].items.push(item);
    return acc;
  }, {});

  if (cart.items.length === 0 && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Your Redis Cart is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Discover great items from independent marketplace merchants and add them to your cart.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs px-6 py-3 rounded-xl shadow transition-transform hover:-translate-y-0.5"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Shopping Cart ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center"
        >
          <Trash2 size={14} className="mr-1" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(vendorGroups).map(([vId, group]) => (
            <div
              key={vId}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Vendor Section Header */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-bold">
                  <Store size={15} className="text-amber-600" />
                  <span>Package from Vendor: {group.vendorName}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  Dispatched Directly by Seller
                </span>
              </div>

              {/* Items from this vendor */}
              <div className="divide-y divide-slate-100 p-5 space-y-4">
                {group.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pt-4 first:pt-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${item.slug || item.productId}`}
                          className="font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <span className="font-bold text-sm text-slate-900 ml-4 shrink-0">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500 font-medium">Qty:</span>
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white text-xs">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
            <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Multi-Vendor Cart Synchronization (Redis Cache)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Your cart is preserved across sessions using fast Redis in-memory storage. At checkout,
                payments are securely split between each independent vendor and the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            {/* Price lines */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {shipping > 0 && (
                <p className="text-[10px] text-slate-400 italic">
                  Free shipping on orders over ₹100!
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Estimated Total</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Code Form */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center">
                <Tag size={13} className="mr-1.5 text-amber-600" />
                Apply Coupon Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Check size={14} className="text-emerald-600" />
                    <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                    <span className="text-emerald-700">(-₹{discountAmount.toFixed(2)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. WELCOME10, MEGA50"
                    className="w-full text-xs uppercase font-mono border border-slate-300 rounded-l-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold px-4 rounded-r-lg transition-colors"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {couponError}
                </p>
              )}
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

