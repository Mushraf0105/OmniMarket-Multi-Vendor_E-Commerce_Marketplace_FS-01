import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, ArrowRight, Eye, Calendar, DollarSign } from 'lucide-react';
import api from '../services/api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Your Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, return, or download invoices for your purchases.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
          Total: {orders.length} orders
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Fetching order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <Package size={40} className="text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our multi-vendor marketplace catalog to place your first order.
          </p>
          <Link
            to="/search"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ORDER PLACED</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL AMOUNT</span>
                    <span className="font-bold text-slate-900">${order.totalAmount?.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">SHIP TO</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {order.shippingAddress?.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ORDER NUMBER</span>
                    <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                  </div>

                  <span
                    className={`uppercase font-bold text-[10px] px-2.5 py-1 rounded-full border ${getStatusColor(
                      order.overallStatus
                    )}`}
                  >
                    {order.overallStatus}
                  </span>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item._id}
                      src={item.image}
                      alt={item.name}
                      title={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <div className="ml-2 text-xs">
                    <p className="font-semibold text-slate-800">{order.items[0]?.name}</p>
                    {order.items.length > 1 && (
                      <p className="text-slate-400 text-[11px]">
                        and {order.items.length - 1} other item{order.items.length > 2 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={`/api/orders/${order._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download size={13} />
                    <span>PDF Invoice</span>
                  </a>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span>Track Order</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
