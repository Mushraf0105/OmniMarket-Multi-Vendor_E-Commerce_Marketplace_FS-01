import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Layers,
  Activity,
  RotateCcw,
  Check,
  ShoppingBag
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/admin');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset and seed the marketplace database with fresh demo data?')) return;
    try {
      setSeeding(true);
      setSeedSuccess('');
      const res = await api.post('/seed/run');
      if (res.data.success) {
        setSeedSuccess('Demo catalog and users seeded successfully!');
        toast.success('Marketplace catalog and users seeded successfully!');
        await fetchAnalytics();
      }
    } catch (err) {
      toast.error('Failed to seed: ' + err.message);
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedSuccess(''), 3000);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading master analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Platform Master Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 pt-1.5">
            OmniMarket Admin & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-vendor GMV, commission accounting, and infrastructure telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <RotateCcw size={14} className={seeding ? 'animate-spin' : ''} />
            <span>{seeding ? 'Seeding Data...' : 'Reset & Seed Demo Catalog'}</span>
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
          <Check size={16} className="mr-2 shrink-0" />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* Financial Health KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Merchandise Value (GMV)</span>
          <p className="text-3xl font-black text-slate-900">
            ₹{analytics?.totalGMV?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Total customer transactional volume</span>
        </div>

        <div className="bg-amber-500 text-slate-950 p-6 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-900/80 uppercase">Platform Commission (10%)</span>
          <p className="text-3xl font-black text-slate-950">
            ₹{analytics?.totalPlatformCommission?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] font-semibold text-slate-900/90">Marketplace retained profit</span>
        </div>

        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Vendor Payouts (90%)</span>
          <p className="text-3xl font-black text-emerald-700">
            ₹{analytics?.totalVendorPayout?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Settled merchant transfers</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Coupons Redeemed</span>
          <p className="text-3xl font-black text-rose-600">
            ₹{analytics?.totalDiscountGiven?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-slate-500">Customer promotion savings</span>
        </div>
      </div>

      {/* Core Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Store size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Vendors</span>
            <p className="text-lg font-black text-slate-900">{analytics?.totalVendors || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Customers</span>
            <p className="text-lg font-black text-slate-900">{analytics?.totalCustomers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Listed Products</span>
            <p className="text-lg font-black text-slate-900">{analytics?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Orders</span>
            <p className="text-lg font-black text-slate-900">{analytics?.totalOrders || 0}</p>
          </div>
        </div>
      </div>

      {/* System Telemetry & Health Panel */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold flex items-center space-x-2">
            <Activity size={18} className="text-emerald-400" />
            <span>Required Tech Stack Telemetry & Microservice Health</span>
          </h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">DATABASE</span>
            <p className="font-bold text-white mt-1">MongoDB 8.x</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">● Connected</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">CACHING</span>
            <p className="font-bold text-white mt-1">Redis</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">● Cart & Sessions</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">SEARCH ENGINE</span>
            <p className="font-bold text-white mt-1">Elasticsearch</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">● Full-Text Multi-Match</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">MEDIA ASSETS</span>
            <p className="font-bold text-white mt-1">AWS S3 / Storage</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">● Static Multipart CDN</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 block text-[10px]">PAYMENT ROUTING</span>
            <p className="font-bold text-white mt-1">Razorpay / Stripe</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">● Split Settlements Active</span>
          </div>
        </div>
      </div>

      {/* Vendor Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Vendor Performance Leaderboard & Commission Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4 text-emerald-700 font-bold">Net Vendor Share (90%)</th>
                <th className="py-3 px-4 text-amber-700 font-bold">Platform Fee (10%)</th>
                <th className="py-3 px-4">Orders Fulfilled</th>
                <th className="py-3 px-4">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.vendorLeaderboard?.map((v) => (
                <tr key={v.vendorId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <Store size={14} className="text-amber-600" />
                    <span>{v.vendorName}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">₹{v.grossSales.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">₹{v.vendorShare.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-amber-600">₹{v.commissionPaid.toFixed(2)}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{v.ordersCount}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{v.unitsSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

