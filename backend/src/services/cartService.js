import redisClient from '../config/redis.js';
import Product from '../models/Product.js';

const CART_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const getCartFromCache = async (cartKey) => {
  const data = await redisClient.get(cartKey);
  if (!data) {
    return { items: [], subtotal: 0, totalItems: 0 };
  }

  const rawCart = JSON.parse(data);
  // Rehydrate current pricing and stock from Product collection
  const productIds = rawCart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .populate('vendor', 'name vendorProfile');

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  let totalItems = 0;

  const validItems = rawCart.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) return null;

    const price = product.price;
    const quantity = Math.min(item.quantity, Math.max(product.stock, 0));
    const itemTotal = price * quantity;

    subtotal += itemTotal;
    totalItems += quantity;

    return {
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      price: product.price,
      stock: product.stock,
      vendor: product.vendor?._id ? product.vendor._id.toString() : product.vendor.toString(),
      vendorName: product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Vendor',
      vendorCommissionRate: product.vendor?.vendorProfile?.commissionRate || 10,
      quantity,
      itemTotal
    };
  }).filter(Boolean);

  const cart = {
    items: validItems,
    subtotal: Math.round(subtotal * 100) / 100,
    totalItems
  };

  return cart;
};

export const saveCartToCache = async (cartKey, items) => {
  const payload = {
    items: items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity
    })),
    updatedAt: new Date().toISOString()
  };

  await redisClient.setex(cartKey, CART_TTL, JSON.stringify(payload));
  return getCartFromCache(cartKey);
};

export const addItemToCart = async (cartKey, { productId, quantity = 1 }) => {
  const currentCart = await getCartFromCache(cartKey);
  const existingItemIndex = currentCart.items.findIndex((i) => i.productId === productId);

  let newItems = [...currentCart.items];
  if (existingItemIndex > -1) {
    newItems[existingItemIndex].quantity += Number(quantity);
  } else {
    newItems.push({ productId, quantity: Number(quantity) });
  }

  return saveCartToCache(cartKey, newItems);
};

export const updateItemQuantity = async (cartKey, productId, quantity) => {
  const currentCart = await getCartFromCache(cartKey);
  let newItems;

  if (Number(quantity) <= 0) {
    newItems = currentCart.items.filter((i) => i.productId !== productId);
  } else {
    newItems = currentCart.items.map((i) => {
      if (i.productId === productId) {
        return { ...i, quantity: Number(quantity) };
      }
      return i;
    });
  }

  return saveCartToCache(cartKey, newItems);
};

export const removeItemFromCart = async (cartKey, productId) => {
  const currentCart = await getCartFromCache(cartKey);
  const newItems = currentCart.items.filter((i) => i.productId !== productId);
  return saveCartToCache(cartKey, newItems);
};

export const emptyCart = async (cartKey) => {
  await redisClient.del(cartKey);
  return { items: [], subtotal: 0, totalItems: 0 };
};

