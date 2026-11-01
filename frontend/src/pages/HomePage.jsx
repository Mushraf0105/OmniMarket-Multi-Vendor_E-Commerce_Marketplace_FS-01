import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  TrendingUp,
  Tag,
  Copy,
  Check,
  Store
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, vendorRes] = await Promise.all([
          api.get('/products?limit=8&sort=newest'),
          api.get('/products/categories/all'),
          api.get('/vendors')
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (vendorRes.data.success) {
          setVendors(vendorRes.data.vendors);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#131921] via-[#232f3e] to-[#0f172a] text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold">
              <Sparkles size={14} />
              <span>Next-Gen Multi-Vendor Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Shop from Verified Vendors, All in One Place.
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              Explore thousands of curated tech, fashion, and home products. Built with
              Elasticsearch search, Redis cart caching, and automated split payments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/search"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-lg shadow-lg transition-transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Browse Products</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/search?sort=rating_desc"
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Top Rated Deals
              </Link>
            </div>
          </div>

          {/* Hero Feature Badges */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-4 rounded-xl">
              <ShieldCheck className="text-amber-400 mb-2" size={26} />
              <h4 className="font-bold text-white text-sm">Split Payouts</h4>
              <p className="text-xs text-slate-400 mt-1">
                90% vendor payout + 10% platform fee handled automatically.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-4 rounded-xl">
              <Truck className="text-amber-400 mb-2" size={26} />
              <h4 className="font-bold text-white text-sm">Order Lifecycle</h4>
              <p className="text-xs text-slate-400 mt-1">
                Placed → Packed → Shipped → Delivered live tracking.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-4 rounded-xl">
              <TrendingUp className="text-amber-400 mb-2" size={26} />
              <h4 className="font-bold text-white text-sm">Elasticsearch</h4>
              <p className="text-xs text-slate-400 mt-1">
                Instant fuzzy search with multi-field scoring.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-4 rounded-xl">
              <Store className="text-amber-400 mb-2" size={26} />
              <h4 className="font-bold text-white text-sm">Multi-Vendor Hub</h4>
              <p className="text-xs text-slate-400 mt-1">
                Independent storefronts and product CRUD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promotional Coupons Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-slate-900 shadow-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center space-x-1.5 bg-black/10 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950">
                <Tag size={13} />
                <span>Special Promo Codes</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950">
                Save Big on Multi-Vendor Orders
              </h3>
              <p className="text-xs font-medium text-slate-900/80">
                Apply these codes directly at checkout for instant discounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { code: 'WELCOME10', label: '10% OFF Any Order' },
                { code: 'MEGA50', label: '$50 OFF Orders > $250' },
                { code: 'FESTIVE20', label: '20% OFF Orders > $100' }
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => copyCouponCode(c.code)}
                  className="bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-lg font-mono font-bold text-xs shadow flex items-center space-x-2 border border-slate-200 transition-all hover:scale-105"
                >
                  <span className="text-amber-600">{c.code}</span>
                  <span className="text-[10px] text-slate-500 font-sans">({c.label})</span>
                  {copiedCoupon === c.code ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} className="text-slate-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Browse popular marketplace collections</p>
          </div>
          <Link
            to="/search"
            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center"
          >
            All Categories <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/search?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-amber-400 transition-all text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-100 ring-2 ring-slate-100 group-hover:ring-amber-400 transition-all">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-1">Top-rated picks from verified marketplace sellers</p>
          </div>
          <Link
            to="/search"
            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center"
          >
            View More <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Verified Vendors Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Marketplace Vendors</h2>
              <p className="text-xs text-slate-500 mt-1">Independent merchants building high quality brands</p>
            </div>
            <Link
              to="/vendor/onboard"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
            >
              Become a Vendor <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendors.slice(0, 3).map((v) => (
              <Link
                key={v._id}
                to={`/vendor/${v._id}`}
                className="group border border-slate-200 hover:border-indigo-400 rounded-xl overflow-hidden transition-all hover:shadow-lg flex flex-col"
              >
                <div className="h-28 bg-slate-200 relative overflow-hidden">
                  <img
                    src={v.vendorProfile?.banner}
                    alt={v.vendorProfile?.storeName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white shadow">
                    <img
                      src={v.vendorProfile?.logo}
                      alt={v.vendorProfile?.storeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="pt-6 p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {v.vendorProfile?.storeName || v.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {v.vendorProfile?.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Verified Store
                    </span>
                    <span className="text-indigo-600 font-semibold group-hover:underline">
                      Visit Store →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
