import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Shield, Store, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);
      toast.success(`Welcome back, ${data?.user?.name || 'User'}!`);
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoRole) => {
    try {
      setLoading(true);
      setError('');
      await login(demoEmail, 'Password@123');
      toast.success(`Logged in as Demo ${demoRole.toUpperCase()}!`);
      if (demoRole === 'admin') navigate('/admin/dashboard');
      else if (demoRole === 'vendor') navigate('/vendor/dashboard');
      else navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          OM
        </div>
        <h1 className="text-2xl font-black text-slate-900 pt-2">Sign in to OmniMarket</h1>
        <p className="text-xs text-slate-500">Access your multi-vendor marketplace account</p>
      </div>

      {/* Quick 1-Click Demo Logins */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
          <span>⚡ 1-Click Instant Demo Access:</span>
          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
            Password: Password@123
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('customer@omnimarket.io', 'customer')}
            className="p-2.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-center text-xs font-semibold text-slate-800 transition-all hover:scale-102 flex flex-col items-center"
          >
            <ShoppingBag size={16} className="text-amber-600 mb-1" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('techvendor@omnimarket.io', 'vendor')}
            className="p-2.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-center text-xs font-semibold text-slate-800 transition-all hover:scale-102 flex flex-col items-center"
          >
            <Store size={16} className="text-amber-600 mb-1" />
            <span>Vendor</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@omnimarket.io', 'admin')}
            className="p-2.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-center text-xs font-semibold text-slate-800 transition-all hover:scale-102 flex flex-col items-center"
          >
            <Shield size={16} className="text-amber-600 mb-1" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-900 font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

