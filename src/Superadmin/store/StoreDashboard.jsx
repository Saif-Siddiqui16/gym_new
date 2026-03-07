import React, { useState, useEffect } from 'react';
import { ShoppingCart, Box, TrendingUp, Layers, AlertTriangle, Search, Clock, Package, CheckCircle, ChevronRight, LayoutGrid, ReceiptText, User } from 'lucide-react';
import { getStoreStats } from '../../api/storeApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';

const StoreDashboard = () => {
    const { selectedBranch } = useBranchContext();
    const navigate = useNavigate();
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('pos'); // pos, orders, products

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const statsData = await getStoreStats({ branchId: branchParam });
            setData(statsData);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBranch]);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold animate-pulse tracking-widest text-xs uppercase">Initializing Store...</p>
            </div>
        );
    }

    const { stats, recentTransactions, orders } = data;

    const basePath = role === 'SUPER_ADMIN' ? '/superadmin/store' : '/branchadmin/store';

    return (
        <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Management</h1>
                    <p className="text-slate-500 text-sm font-medium">POS, products & online store overview</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(`${basePath}/pos`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:bg-[#6d28d9] transition-all"
                    >
                        <ShoppingCart size={18} /> Open POS
                    </button>
                    <button
                        onClick={() => navigate(`${basePath}/products`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <Box size={18} /> Manage Products
                    </button>
                </div>
            </div>

            {/* Store Overview Banner */}
            <div className="bg-white rounded-[2rem] p-8 mb-8 text-slate-900 relative overflow-hidden shadow-sm border border-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <h2 className="text-2xl font-black mb-1 text-slate-900">Store Overview</h2>
                        <p className="text-slate-500 text-sm font-medium">Today's sales & inventory at a glance</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 w-full md:w-auto">
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Sales</p>
                            <p className="text-2xl font-black text-slate-900">{stats.totalSales}</p>
                            {stats.salesTrend && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${stats.salesTrend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : stats.salesTrend.direction === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {stats.salesTrend.value}
                                </span>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Products</p>
                            <p className="text-2xl font-black text-slate-900">{stats.productsCount}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Today's POS</p>
                            <p className="text-2xl font-black text-slate-900">₹{stats.todayPos.toLocaleString()}</p>
                            {stats.posTrend && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${stats.posTrend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : stats.posTrend.direction === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {stats.posTrend.value}
                                </span>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
                            {stats.revenueTrend && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${stats.revenueTrend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : stats.revenueTrend.direction === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {stats.revenueTrend.value}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Profit */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative group hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-bold">Profit</h3>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900">₹{stats.profit.toLocaleString()}</p>
                    {stats.profitTrend && (
                        <div className="mt-2">
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${stats.profitTrend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : stats.profitTrend.direction === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                                {stats.profitTrend.value}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stock Value */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative group hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-bold">Stock Value</h3>
                        <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center">
                            <Layers size={16} />
                        </div>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className="text-3xl font-black text-slate-900">₹{stats.stockValue.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs font-bold mb-1.5">{stats.productsCount} items in stock</p>
                    </div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full border-4 border-slate-50 border-t-violet-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative group hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-bold">Low Stock Alert</h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.lowStockCount > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{stats.lowStockCount}</p>
                        <p className="text-slate-400 text-xs font-bold mb-1.5">{stats.lowStockCount === 0 ? 'All stock levels are healthy' : 'Items need restocking'}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-tighter rounded-full">{stats.pendingOrders} pending orders</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-tighter rounded-full">{stats.todaySalesCount} sales today</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
                        <h3 className="text-lg font-black text-slate-900 mb-6 px-2">Recent Transactions</h3>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-violet-600 transition-colors">
                                                <ReceiptText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Order #{tx.id.slice(-6)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.itemsCount} items • {new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">₹{parseFloat(tx.amount).toLocaleString()}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-tighter ${tx.status === 'Completed' ? 'text-emerald-600' : 'text-orange-500'}`}>{tx.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <p className="text-slate-400 font-bold italic">No sales yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                        {/* Tab Headers */}
                        <div className="flex items-center gap-1 p-2 bg-slate-50/50 border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('pos')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'pos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ShoppingCart size={16} /> POS History ({stats.totalSales})
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Package size={16} /> Store Orders ({stats.pendingOrders})
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Box size={16} /> Products
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                            {activeTab === 'pos' && (
                                <div className="space-y-2">
                                    {orders.length > 0 ? (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">
                                                    <th className="px-4 py-3">Order ID</th>
                                                    <th className="px-4 py-3">Member</th>
                                                    <th className="px-4 py-3">Amount</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {orders.map(o => (
                                                    <tr key={o.id} className="text-sm group hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 font-bold text-slate-900">#{o.id.toString().padStart(4, '0')}</td>
                                                        <td className="px-4 py-3 text-slate-600 font-medium">{o.memberName || 'Guest'}</td>
                                                        <td className="px-4 py-3 font-black text-slate-900">₹{parseFloat(o.totalAmount).toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Package size={48} className="text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">No online orders yet</p>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <button
                                        onClick={() => navigate(`${basePath}/products`)}
                                        className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-violet-200 hover:bg-violet-700 transition-all"
                                    >
                                        View Product List
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDashboard;
