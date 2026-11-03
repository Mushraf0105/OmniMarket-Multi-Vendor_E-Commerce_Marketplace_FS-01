import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  FileText,
  Package,
  ArrowRight,
  ShieldCheck,
  Building,
  Download
} from 'lucide-react';
import api, { downloadOrderInvoicePDF } from '../services/api';
import { toast } from 'react-toastify';
import LifecycleTracker from '../components/LifecycleTracker';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      await downloadOrderInvoicePDF(id, order?.orderNumber);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Invoice download failed:', err);
      toast.error('Could not download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-xs">Loading order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link to="/" className="text-indigo-600 hover:underline text-xs mt-2 inline-block">
          Return to Marketplace Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Success Card Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={36} />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Completed & Split Transfer Initiated
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500">
            Order Confirmation # <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download size={15} className={downloading ? 'animate-bounce' : ''} />
            <span>{downloading ? 'Downloading Official PDF...' : 'Download Official PDF Invoice'}</span>
          </button>

          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            <Package size={15} />
            <span>View All My Orders</span>
          </Link>
        </div>
      </div>

      {/* Order Lifecycle Progress Bar */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Order Fulfillment Lifecycle</h2>
        <LifecycleTracker
          currentStatus={order.overallStatus}
          statusHistory={order.statusHistory}
        />
      </div>

      {/* Order Item Details & Split Payout Confirmation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Itemized Multi-Vendor Package Breakdown
        </h3>

        <div className="divide-y divide-slate-100 space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-4 pt-4 first:pt-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                    <Building size={12} className="mr-1 text-slate-400" />
                    Vendor: <strong className="ml-1 text-slate-700">{item.vendorName}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Qty: {item.quantity}</span>
                  <span className="capitalize font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Status: {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between text-xs text-slate-600 gap-4">
          <div>
            <p className="font-bold text-slate-900 mb-1">Delivering To:</p>
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p>Subtotal: <strong className="text-slate-900">₹{order.subtotal?.toFixed(2)}</strong></p>
            {order.discount > 0 && (
              <p className="text-emerald-600 font-semibold">
                Coupon ({order.couponApplied?.code}): -₹{order.discount.toFixed(2)}
              </p>
            )}
            <p>Tax (8%): <strong className="text-slate-900">₹{order.tax?.toFixed(2)}</strong></p>
            <p>Shipping: <strong className="text-slate-900">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee?.toFixed(2)}`}</strong></p>
            <p className="text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
              Total Paid: ₹{order.totalAmount?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

