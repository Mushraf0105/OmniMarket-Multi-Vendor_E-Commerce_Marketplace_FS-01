import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Building,
  Truck,
  ArrowLeft,
  Calendar,
  CreditCard,
  CheckCircle,
  FileText
} from 'lucide-react';
import api, { downloadOrderInvoicePDF } from '../services/api';
import { toast } from 'react-toastify';
import LifecycleTracker from '../components/LifecycleTracker';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!order) return;
    try {
      setDownloading(true);
      await downloadOrderInvoicePDF(order._id, order.orderNumber);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Invoice download failed:', err);
      toast.error('Could not download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="text-indigo-600 text-xs mt-2 inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/orders" className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Download size={14} className={downloading ? 'animate-bounce' : ''} />
          <span>{downloading ? 'Generating PDF Invoice...' : 'Download PDF Tax Invoice'}</span>
        </button>
      </div>

      {/* Lifecycle Tracker */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center">
          <Truck size={16} className="mr-2 text-amber-500" />
          Fulfillment Progress
        </h2>
        <LifecycleTracker
          currentStatus={order.overallStatus}
          statusHistory={order.statusHistory}
        />
      </div>

      {/* Itemized Packages by Vendor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Package Contents ({order.items.length} items)
        </h3>

        <div className="divide-y divide-slate-100 space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-4 pt-4 first:pt-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs mt-1 flex items-center">
                    <Building size={12} className="mr-1 text-slate-400" />
                    Fulfilled by: <strong className="ml-1 text-slate-800">{item.vendorName}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] mt-2 gap-2">
                  <span className="text-slate-500 font-medium">
                    Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {item.trackingNumber && (
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Tracking: {item.trackingNumber} ({item.shippingCarrier || 'Carrier'})
                      </span>
                    )}
                    <span className="capitalize font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Status: {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Shipping Address
          </h4>
          <p className="font-semibold text-slate-800">{order.shippingAddress?.fullName}</p>
          <p className="text-slate-600">{order.shippingAddress?.addressLine1}</p>
          <p className="text-slate-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
          </p>
          <p className="text-slate-600">{order.shippingAddress?.country}</p>
          <p className="text-slate-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Payment & Split Summary
          </h4>
          <div className="flex justify-between text-slate-600">
            <span>Payment Method</span>
            <span className="font-bold uppercase text-slate-800">{order.payment?.method}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Transaction ID</span>
            <span className="font-mono text-slate-800">{order.payment?.transactionId || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal?.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount</span>
              <span>-₹{order.discount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Tax (8%)</span>
            <span>₹{order.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee?.toFixed(2)}`}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-bold text-sm text-slate-900">
            <span>Total Paid</span>
            <span className="text-lg font-black">₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

