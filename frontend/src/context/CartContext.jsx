import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
        // Recalculate coupon if one was active
        if (appliedCoupon) {
          recalcDiscount(appliedCoupon, res.data.cart.subtotal);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const recalcDiscount = (coupon, subtotal) => {
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
    setDiscountAmount(Math.round(discount * 100) / 100);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart/add', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        if (appliedCoupon) recalcDiscount(appliedCoupon, res.data.cart.subtotal);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add item' };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put('/cart/update', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        if (appliedCoupon) recalcDiscount(appliedCoupon, res.data.cart.subtotal);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update' };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        if (appliedCoupon) recalcDiscount(appliedCoupon, res.data.cart.subtotal);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove' };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        cartTotal: cart.subtotal
      });
      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        setDiscountAmount(res.data.coupon.discountAmount);
        return { success: true, coupon: res.data.coupon };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or expired coupon'
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
