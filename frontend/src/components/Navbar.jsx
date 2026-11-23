import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Store,
  ShieldCheck,
  Package,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout, isVendor, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories/all');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-900 text-xl tracking-tighter group-hover:rotate-6 transition-transform">
              OM
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Omni<span className="text-amber-400">Market</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold">
                MULTI-VENDOR
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center relative"
          >
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2.5 px-3 rounded-l-md border-r border-slate-300 focus:outline-none cursor-pointer appearance-none pr-7"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>

            <input
              type="text"
              placeholder="Search products across verified vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-sm py-2 px-4 focus:outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              aria-label="Search"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-5 py-2.5 rounded-r-md transition-colors flex items-center justify-center"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Right Navigation Controls */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Vendor Onboarding CTA if not yet a vendor */}
            {!isVendor && !isAdmin && (
              <Link
                to={user ? "/vendor/onboard" : "/login"}
                className="hidden lg:flex items-center text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors py-1.5 px-2.5 rounded border border-slate-700 hover:border-amber-400/50"
              >
                <Store size={14} className="mr-1.5 text-amber-400" />
                Sell on OmniMarket
              </Link>
            )}

            {/* User Dropdown / Auth Links */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-left py-1 px-2 rounded hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-xs">
                    <p className="text-slate-400 text-[10px] leading-tight">
                      Hello, {user.name.split(' ')[0]}
                    </p>
                    <p className="font-bold text-white capitalize leading-tight flex items-center">
                      {user.role} <ChevronDown size={12} className="ml-1 text-slate-400" />
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-2 z-50 text-sm animate-fade-in"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {user.role} Account
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                    >
                      <Package size={16} className="mr-2 text-slate-400" />
                      My Orders
                    </Link>

                    {isVendor && (
                      <>
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                        >
                          <Store size={16} className="mr-2 text-amber-500" />
                          Vendor Portal
                        </Link>
                        <Link
                          to="/vendor/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                        >
                          <Layers size={16} className="mr-2 text-amber-500" />
                          Manage Products
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                      >
                        <ShieldCheck size={16} className="mr-2 text-rose-500" />
                        Admin Analytics
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        toast.info('Signed out successfully');
                        navigate('/');
                      }}
                      className="w-full flex items-center px-4 py-2 hover:bg-rose-50 text-rose-600 text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-white hover:text-amber-400 transition-colors py-1.5 px-3 rounded hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-1.5 px-3.5 rounded transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Cart Link with Redis badge */}
            <Link
              to="/cart"
              className="relative flex items-center text-white hover:text-amber-400 transition-colors py-1 px-2 rounded"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#131921] animate-scale-in">
                    {cart.totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-xs ml-2">Cart</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation categories strip */}
      <div className="bg-[#232f3e] border-t border-slate-700/50 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center space-x-6 text-xs text-slate-300 overflow-x-auto scrollbar-none">
          <Link
            to="/search"
            className="flex items-center text-white hover:text-amber-400 font-medium shrink-0"
          >
            <Menu size={16} className="mr-1 text-slate-400" />
            All Products
          </Link>

          {categories.slice(0, 7).map((c) => (
            <Link
              key={c._id}
              to={`/search?category=${encodeURIComponent(c.name)}`}
              className="hover:text-amber-400 transition-colors shrink-0"
            >
              {c.name}
            </Link>
          ))}

          <span className="text-slate-500">|</span>

          <Link
            to="/search?sort=rating_desc"
            className="text-amber-300 hover:text-amber-200 flex items-center font-medium shrink-0"
          >
            <Sparkles size={13} className="mr-1" />
            Top Rated Deals
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden p-3 bg-[#232f3e] border-t border-slate-700">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search all marketplace products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs py-2 px-3 rounded-l-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amber-400 text-slate-900 px-4 rounded-r-md flex items-center justify-center"
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2 text-sm">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-200 hover:text-amber-400"
          >
            Browse All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/search?category=${encodeURIComponent(c.name)}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-slate-400 hover:text-amber-400 pl-2 text-xs"
            >
              {c.name}
            </Link>
          ))}
          {user && (
            <>
              <div className="border-t border-slate-800 pt-2"></div>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-200"
              >
                My Orders
              </Link>
              {isVendor && (
                <Link
                  to="/vendor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-amber-400"
                >
                  Vendor Portal
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-rose-400"
                >
                  Admin Analytics
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

