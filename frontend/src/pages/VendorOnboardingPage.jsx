import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VendorOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState(user?.vendorProfile?.storeName || '');
  const [description, setDescription] = useState(user?.vendorProfile?.description || '');
  const [banner, setBanner] = useState(user?.vendorProfile?.banner || '');
  const [logo, setLogo] = useState(user?.vendorProfile?.logo || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [bankDetails, setBankDetails] = useState({
    accountHolder: user?.vendorProfile?.bankDetails?.accountHolder || user?.name || '',
    accountNumber: user?.vendorProfile?.bankDetails?.accountNumber || '',
    routingOrIfsc: user?.vendorProfile?.bankDetails?.routingOrIfsc || '',
    bankName: user?.vendorProfile?.bankDetails?.bankName || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/vendors/onboard', {
        storeName,
        description,
        banner,
        logo,
        phone,
        bankDetails
      });

      if (res.data.success) {
        setMessage('Vendor onboarding saved! Redirecting to merchant portal...');
        setTimeout(() => navigate('/vendor/dashboard'), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto shadow-inner">
          <Store size={26} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Vendor Onboarding & Store Profile</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Configure your storefront and payout details. Start selling and receiving 90% net earnings per sale.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
          <CheckCircle2 size={16} className="mr-2 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Store Profile */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <Store size={16} className="mr-2 text-amber-600" />
            1. Storefront Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex Tech Audio"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-800-555-0101"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your brand, specialty, and product quality..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Logo Image URL</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Banner Image URL</label>
              <input
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Banking and Payout Split Details */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <Building size={16} className="mr-2 text-amber-600" />
            2. Bank Settlement & Payout Information (Razorpay / Stripe)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={bankDetails.accountHolder}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g. Chase Commercial"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="••••••••••"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Routing / IFSC Code</label>
              <input
                type="text"
                value={bankDetails.routingOrIfsc}
                onChange={(e) => setBankDetails({ ...bankDetails, routingOrIfsc: e.target.value })}
                placeholder="ROUTING1234"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Platform Commission Notice */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3 text-slate-600">
          <CreditCard size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Marketplace Split Terms</span>
            <p className="text-[11px] mt-0.5">
              OmniMarket retains a standard 10% platform commission on settled orders. 90% net revenue is
              deposited directly to your designated bank account via automated gateway split transfers.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <span>{loading ? 'Saving Onboarding...' : 'Save & Enter Vendor Portal'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};

export default VendorOnboardingPage;

