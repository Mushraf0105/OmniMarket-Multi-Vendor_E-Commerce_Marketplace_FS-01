import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      await register({
        name,
        email,
        password,
        phone,
        role,
        storeName: role === 'vendor' ? storeName : undefined,
        storeDescription: role === 'vendor' ? storeDescription : undefined
      });

      if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          OM
        </div>
        <h1 className="text-2xl font-black text-slate-900 pt-2">Join OmniMarket</h1>
        <p className="text-xs text-slate-500">Create your customer or merchant vendor account</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Choose Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center space-x-2 transition-all ${
                  role === 'customer'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <ShoppingBag size={16} className={role === 'customer' ? 'text-amber-600' : ''} />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center space-x-2 transition-all ${
                  role === 'vendor'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Store size={16} className={role === 'vendor' ? 'text-amber-600' : ''} />
                <span>Vendor Seller</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@example.com"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0199"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Conditional Vendor Fields */}
          {role === 'vendor' && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Merchant Store Details
              </span>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Artisan Living Gear"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Briefly describe what your store sells..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-900 font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 text-sm pt-2"
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

