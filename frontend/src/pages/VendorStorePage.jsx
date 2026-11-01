import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, ShieldCheck, Mail, Phone, Package, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const VendorStorePage = () => {
  const { id } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vendors/profile/${id}`);
        if (res.data.success) {
          setVendorData(res.data);
        }
      } catch (err) {
        console.error('Failed to load vendor store:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading storefront...</p>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Storefront not found</h2>
        <Link to="/search" className="text-indigo-600 text-xs mt-2 inline-block">
          Browse all products
        </Link>
      </div>
    );
  }

  const { vendor, products } = vendorData;
  const profile = vendor.profile || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Store Banner & Brand Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-44 sm:h-60 bg-slate-200 relative overflow-hidden">
          <img
            src={profile.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
            alt={profile.storeName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-16 gap-4">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-md shrink-0">
                <img
                  src={profile.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80'}
                  alt={profile.storeName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    {profile.storeName || vendor.name}
                  </h1>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} className="mr-1 text-emerald-600" />
                    Verified Merchant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {profile.description || 'Welcome to our verified merchant store!'}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 sm:text-right shrink-0">
              {vendor.email && (
                <p className="flex items-center sm:justify-end">
                  <Mail size={13} className="mr-1.5 text-slate-400" />
                  <span>{vendor.email}</span>
                </p>
              )}
              {vendor.phone && (
                <p className="flex items-center sm:justify-end">
                  <Phone size={13} className="mr-1.5 text-slate-400" />
                  <span>{vendor.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products from this vendor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Products from {profile.storeName || vendor.name} ({products.length})
          </h2>
          <Link
            to="/search"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft size={13} className="mr-1" />
            Back to Marketplace
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            This merchant currently has no listed products.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={{ ...p, vendor }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStorePage;
