import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VendorDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/vendors/dashboard/stats'),
        api.get('/vendors/orders')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      setUpdatingId(`${orderId}-${itemId}`);
      let trackingNumber = '';
      let shippingCarrier = 'FedEx Express';

      if (newStatus === 'shipped') {
        trackingNumber = prompt('Enter shipping carrier tracking number:', `TRK-${Date.now().toString().slice(-8)}`);
        if (!trackingNumber) {
          setUpdatingId(null);
          return;
        }
      }

      const res = await api.put(`/vendors/orders/${orderId}/items/${itemId}/status`, {
        status: newStatus,
        trackingNumber,
        shippingCarrier
      });

      if (res.data.success) {
        setSuccessMsg(`Status updated to '${newStatus}'!`);
        setTimeout(() => setSuccessMsg(''), 2500);
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Merchant Vendor Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 pt-1.5">
            {user?.vendorProfile?.storeName || `${user?.name}'s Store`}
          </h1>
          <p className="text-xs text-slate-500">
            Manage your orders, inventory, and track your 90% split settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/vendor/products"
            className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors"
          >
            <Layers size={15} />
            <span>Manage Product Catalog</span>
          </Link>

          <Link
            to={`/vendor/${user?._id}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2.5 rounded-xl transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
          <CheckCircle size={16} className="mr-2 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Sales</span>
          <p className="text-2xl font-black text-slate-900">
            ₹{stats?.totalGrossSales?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-slate-500">Total customer orders</span>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Net Earnings (90%)</span>
          <p className="text-2xl font-black text-emerald-700">
            ₹{stats?.netVendorEarnings?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Your settled payout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Fee (10%)</span>
          <p className="text-2xl font-black text-amber-600">
            ₹{stats?.totalPlatformCommission?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-slate-500">Marketplace commission</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</span>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalOrders || 0}
          </p>
          <span className="text-[10px] text-slate-500">{stats?.itemsSold || 0} units sold</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Fulfillment</span>
          <p className={`text-2xl font-black ${stats?.pendingFulfillmentCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {stats?.pendingFulfillmentCount || 0}
          </p>
          <span className="text-[10px] text-slate-500">Items to pack & ship</span>
        </div>
      </div>

      {/* Incoming Orders & Lifecycle Operations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Orders Requiring Merchant Fulfillment ({orders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Update item fulfillment lifecycle stage (Placed → Packed → Shipped → Delivered)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading incoming merchant orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No orders received yet. Keep your inventory updated to attract buyers!
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                {/* Order Top Strip */}
                <div className="bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between text-xs gap-3 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900">Order #{order.orderNumber}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600">Customer: {order.customer?.name} ({order.customer?.email})</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-slate-500">
                      Destination: {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Your Payout: ₹{order.vendorNetShare?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items in this order belonging to this vendor */}
                <div className="p-4 divide-y divide-slate-100">
                  {order.items.map((item) => {
                    const isProcessing = updatingId === `${order._id}-${item._id}`;

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 first:pt-0 gap-3"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-slate-500">
                              Qty: {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                Current: {item.status}
                              </span>
                              {item.trackingNumber && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Track: {item.trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lifecycle update buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {item.status === 'placed' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateItemStatus(order._id, item._id, 'packed')}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {isProcessing ? 'Updating...' : 'Mark as Packed'}
                            </button>
                          )}

                          {['placed', 'packed'].includes(item.status) && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateItemStatus(order._id, item._id, 'shipped')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <Truck size={13} />
                              <span>{isProcessing ? '...' : 'Ship Package'}</span>
                            </button>
                          )}

                          {item.status === 'shipped' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateItemStatus(order._id, item._id, 'delivered')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle size={13} />
                              <span>{isProcessing ? '...' : 'Mark Delivered'}</span>
                            </button>
                          )}

                          {item.status === 'delivered' && (
                            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboardPage;

