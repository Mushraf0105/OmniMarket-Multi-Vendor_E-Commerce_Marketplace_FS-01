import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  RotateCcw,
  Star,
  Search,
  Zap,
  Check
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSource, setSearchSource] = useState('elasticsearch');
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';

  const [localQ, setLocalQ] = useState(q);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalQ(q);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [q, minPrice, maxPrice]);

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

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(location.search);
        if (!queryParams.has('limit')) queryParams.set('limit', '24');

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalCount(res.data.total);
          setSearchSource(res.data.source);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [location.search]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/search');
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (localMinPrice) params.set('minPrice', localMinPrice);
    else params.delete('minPrice');

    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    else params.delete('maxPrice');

    navigate(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', localQ);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb & Search Engine Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {q ? `Search Results for "${q}"` : category ? `Category: ${category}` : 'All Marketplace Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found <span className="font-semibold text-slate-900">{totalCount}</span> items matching your criteria
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Elasticsearch or Mongo Fallback Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Zap size={14} className="text-emerald-600 fill-emerald-600" />
            <span>Search Engine: {searchSource === 'elasticsearch' ? 'Elasticsearch 8.x' : 'Faceted Full-Text Search'}</span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-slate-300 text-xs font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Avg. Customer Review</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center">
                <SlidersHorizontal size={16} className="mr-2 text-slate-600" />
                Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center font-medium"
              >
                <RotateCcw size={12} className="mr-1" />
                Reset
              </button>
            </div>

            {/* Keyword Query */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Keywords
              </label>
              <form onSubmit={handleSearchSubmit} className="flex">
                <input
                  type="text"
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                  placeholder="e.g. wireless, leather"
                  className="w-full text-xs border border-slate-300 rounded-l-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-3 rounded-r-lg"
                >
                  <Search size={14} />
                </button>
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Categories
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-xs py-1 px-2 rounded font-medium transition-colors ${
                    !category
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateParam('category', c.name)}
                    className={`w-full text-left text-xs py-1 px-2 rounded font-medium flex items-center justify-between transition-colors ${
                      category === c.name
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.productCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Price Range (₹)
              </label>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* Customer Rating Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Customer Rating
              </label>
              <div className="space-y-1.5">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam('minRating', minRating === r.toString() ? '' : r)}
                    className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded transition-colors ${
                      minRating === r.toString()
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < r ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                          />
                        ))}
                      </div>
                      <span className="text-[11px]">& Up</span>
                    </div>
                    {minRating === r.toString() && <Check size={14} className="text-amber-800" />}
                  </button>
                ))}
              </div>
            </div>

            {/* In-stock Only */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Exclude Out of Stock</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Results Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filter criteria or searching with broader keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;

