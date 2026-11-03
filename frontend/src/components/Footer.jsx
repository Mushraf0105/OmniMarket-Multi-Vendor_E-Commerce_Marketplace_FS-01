import React from 'react';
import { Shield, Zap, RefreshCw, Database, Server, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#131921] text-slate-400 text-sm mt-16 border-t border-slate-800">
      {/* Platform feature highlights */}
      <div className="bg-[#232f3e] py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center space-x-3">
              <Shield className="text-amber-400 shrink-0" size={24} />
              <div>
                <p className="text-white font-semibold text-xs">Secure Split Payments</p>
                <p className="text-[11px] text-slate-400">Razorpay & Stripe Connect</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Zap className="text-amber-400 shrink-0" size={24} />
              <div>
                <p className="text-white font-semibold text-xs">Elasticsearch Engine</p>
                <p className="text-[11px] text-slate-400">Instant multi-match & filters</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RefreshCw className="text-amber-400 shrink-0" size={24} />
              <div>
                <p className="text-white font-semibold text-xs">Redis Caching</p>
                <p className="text-[11px] text-slate-400">Cart & session high speed</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Database className="text-amber-400 shrink-0" size={24} />
              <div>
                <p className="text-white font-semibold text-xs">Multi-Vendor Hub</p>
                <p className="text-[11px] text-slate-400">Independent vendor payouts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded bg-amber-400 flex items-center justify-center font-bold text-slate-900 text-sm">
                OM
              </div>
              <span className="text-white font-bold text-lg">OmniMarket</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enterprise Multi-Vendor E-Commerce Platform built for seamless merchant onboarding,
              real-time Elasticsearch product discovery, Redis cart caching, and automated split settlements.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">React</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Node.js</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">MongoDB</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Elasticsearch</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Redis</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">AWS S3</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Razorpay</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Marketplace Roles
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-300 font-medium">Customer:</span> Browse, Redis cart, checkout, PDF invoice</li>
              <li><span className="text-slate-300 font-medium">Vendor:</span> Product CRUD, image upload, order fulfillment</li>
              <li><span className="text-slate-300 font-medium">Admin:</span> GMV metrics, commission tracking, system health</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Order Lifecycle
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><span className="text-amber-400 font-mono">1. PLACED:</span> Order & split settlement created</li>
              <li><span className="text-amber-400 font-mono">2. PACKED:</span> Vendor packages items</li>
              <li><span className="text-amber-400 font-mono">3. SHIPPED:</span> Carrier tracking dispatched</li>
              <li><span className="text-amber-400 font-mono">4. DELIVERED:</span> Final customer fulfillment</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Demo Credentials
            </h4>
            <div className="bg-slate-900/80 rounded p-2.5 text-[11px] font-mono space-y-1 border border-slate-800">
              <p><span className="text-amber-400">Admin:</span> admin@omnimarket.io</p>
              <p><span className="text-amber-400">Vendor:</span> techvendor@omnimarket.io</p>
              <p><span className="text-amber-400">Customer:</span> customer@omnimarket.io</p>
              <p><span className="text-slate-500">Password:</span> Password@123</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 OmniMarket Multi-Vendor Platform. Full-Stack Assessment FS-01.</p>
          <p className="mt-2 sm:mt-0">Built with React, Express, MongoDB, Redis & Elasticsearch.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

