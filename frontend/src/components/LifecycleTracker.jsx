import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Home } from 'lucide-react';

const stages = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'packed', label: 'Packed & Ready', icon: Package },
  { key: 'shipped', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home }
];

const LifecycleTracker = ({ currentStatus, statusHistory = [] }) => {
  const getStageIndex = (status) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'packed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-6 px-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between relative">
        {/* Background connector bar */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
        
        {/* Active connector bar */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 100 * 0.88}%` }}
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          // Find timestamp from history if available
          const historyItem = statusHistory.find((h) => h.status === stage.key);

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                } ${isCurrent ? 'scale-110 shadow-md ring-emerald-200' : ''}`}
              >
                {isCompleted ? <Icon size={20} /> : <Icon size={18} />}
              </div>

              <div className="text-center mt-2.5">
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
                {historyItem && (
                  <p className="text-[10px] text-slate-400">
                    {new Date(historyItem.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifecycleTracker;
