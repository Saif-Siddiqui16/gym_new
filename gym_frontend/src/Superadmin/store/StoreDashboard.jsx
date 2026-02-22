import React from 'react';
import { LayoutDashboard, Box, ShoppingCart, Archive, TrendingUp, Package, CreditCard, ChevronRight } from 'lucide-react';

const StoreDashboard = () => {
    const stats = [
        { label: 'Total Products', value: '3', icon: Box, color: 'violet', trend: '+12%' },
        { label: 'Total Orders', value: '10', icon: ShoppingCart, color: 'emerald', trend: '+5%' },
        { label: 'Stock Value', value: '₹1,25,000', icon: CreditCard, color: 'blue', trend: '+₹25k' },
        { label: 'Total Sold', value: '50', icon: Package, color: 'orange', trend: '+15' },
    ];

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Header */}
            <div className="mb-8 relative p-6 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
                            <LayoutDashboard className="text-slate-800" size={28} />
                            Store Dashboard
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Overview of products, orders, and inventory</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-${stat.color}-600`}>
                            <stat.icon size={64} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-200`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                            </div>
                            <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</div>
                            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-tight">
                            <TrendingUp className="text-violet-600" size={20} />
                            Recent Sales Activity
                        </div>
                        <button className="text-xs font-black text-violet-600 hover:underline">View All Orders</button>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-white rounded-2xl shadow-md hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <ShoppingCart size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">Order #102{i}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">2 items • ₹4,500</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-emerald-600 mb-0.5 uppercase tracking-widest">Completed</span>
                                <span className="text-[8px] text-slate-400 font-medium">10 mins ago</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-tight px-1 mb-2">
                        <Archive className="text-orange-500" size={20} />
                        Low Stock Alert
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-white p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-600 font-black text-xs">DB</div>
                                <span className="text-xs font-black text-red-950 uppercase tracking-tight">Dumbbells...</span>
                            </div>
                            <span className="text-[10px] font-black text-red-600 px-2 py-1 bg-white rounded-lg">10 left</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-600 font-black text-xs">YM</div>
                                <span className="text-xs font-black text-orange-950 uppercase tracking-tight">Yoga Mat...</span>
                            </div>
                            <span className="text-[10px] font-black text-orange-600 px-2 py-1 bg-white rounded-lg">30 left</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDashboard;
