import React, { useState, useEffect } from 'react';
import { Search, Filter, Ticket, Plus, Edit2, Trash2, ChevronRight, Zap, CheckCircle2, XCircle, Timer, BarChart3, MoreVertical, Percent } from 'lucide-react';
import { getCoupons, deleteCoupon, getCouponStats } from '../../api/storeApi';
import CouponDrawer from './CouponDrawer';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';

const Coupons = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCoupons: 0,
        activeCoupons: 0,
        expiredCoupons: 0,
        totalRedemptions: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const [couponsData, statsData] = await Promise.all([
                getCoupons({ search: searchTerm, status: statusFilter, branchId: branchParam }),
                getCouponStats({ branchId: branchParam })
            ]);
            setCoupons(couponsData);
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, selectedBranch]);

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleAdd = () => {
        setSelectedCoupon(null);
        setDrawerMode('add');
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(id);
                toast.success('Coupon deleted');
                fetchData();
            } catch (error) {
                toast.error(error || 'Failed to delete');
            }
        }
    };

    const statsCards = [
        { label: 'Total Coupons', value: stats.totalCoupons, icon: Ticket, color: 'text-primary', bg: 'bg-primary-light' },
        { label: 'Active Codes', value: stats.activeCoupons, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Expired', value: stats.expiredCoupons, icon: Timer, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Total Redemptions', value: stats.totalRedemptions, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-primary-light/20 p-4 sm:p-8 min-h-screen">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-violet-200">
                            <Percent size={24} className="text-white" />
                        </div>
                        Discount Coupons
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-2">
                        Create and manage promo codes for store & POS
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-md shadow-violet-200 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Create New Coupon
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statsCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-50 flex items-center gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm shadow-current/10`}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Filters Section */}
                <div className="p-8 border-b border-slate-100 bg-white/50 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by coupon code..."
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-[200px]">
                            <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-14 pr-10 py-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Expired</option>
                            </select>
                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="saas-table-wrapper border-0 rounded-none">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="bg-slate-50/50">
                            <tr className="border-b border-slate-100">
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Settings</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Validity</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Scanning Database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : coupons.length > 0 ? (
                                coupons.map((c) => (
                                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer">
                                        <td className="px-8 py-6" data-label="Coupon">
                                            <div className="flex items-center gap-4 justify-end sm:justify-start">
                                                <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-primary-light rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform duration-300 border border-slate-100 shadow-sm flex-shrink-0">
                                                    <Ticket size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <div className="w-1 h-1 rounded-full bg-[#7c3aed]"></div>
                                                        <span className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest">{c.tenant?.name || 'Main Branch'}</span>
                                                    </div>
                                                    <p className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{c.code}</p>
                                                    <p className="text-xs text-slate-400 font-bold truncate max-w-[180px] mt-0.5">{c.description || 'No description provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6" data-label="Discount">
                                            <div className="text-right sm:text-left">
                                                <p className="text-sm font-black text-slate-900">
                                                    {c.type === 'Percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                    Min Purchase ₹{c.minPurchase}
                                                    {c.maximumDiscount && c.maximumDiscount > 0 ? ` | Max Cap ₹${c.maximumDiscount}` : ''}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6" data-label="Settings">
                                            <div className="text-right sm:text-left space-y-1">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block ${c.applicableService === 'All' ? 'bg-slate-100 text-slate-600' :
                                                        c.applicableService === 'Membership' ? 'bg-blue-50 text-blue-600' :
                                                            c.applicableService === 'PT' ? 'bg-orange-50 text-orange-600' :
                                                                'bg-purple-50 text-purple-600'
                                                    }`}>
                                                    Service: {c.applicableService || 'All'}
                                                </span>
                                                <br />
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block ${c.visibilityType === 'Public' ? 'bg-emerald-50 text-emerald-600' :
                                                        c.visibilityType === 'Targeted' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    Vis: {c.visibilityType || 'Public'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6" data-label="Performance">
                                            <div className="space-y-1.5 flex flex-col items-end sm:items-start">
                                                <div className="flex justify-between w-32">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</span>
                                                    <span className="text-[10px] font-black text-slate-900">{c.usedCount} / {c.maxUses === 0 ? '∞' : c.maxUses}</span>
                                                </div>
                                                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-700"
                                                        style={{ width: `${c.maxUses === 0 ? 100 : Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6" data-label="Validity">
                                            <div className="space-y-1 text-right sm:text-left">
                                                <div className="flex items-center gap-2 justify-end sm:justify-start text-xs font-bold text-slate-600">
                                                    <Timer size={14} className="text-slate-300" />
                                                    {new Date(c.startDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    TO {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'UNTIL CANCELLED'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {(() => {
                                                const isExpired = c.status === 'Expired' || (c.endDate && new Date(c.endDate) < new Date());
                                                const displayStatus = isExpired ? 'Expired' : c.status;

                                                return (
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-sm ${displayStatus === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : displayStatus === 'Expired'
                                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${displayStatus === 'Active' ? 'bg-emerald-500 animate-pulse' :
                                                            displayStatus === 'Expired' ? 'bg-red-500' : 'bg-slate-400'
                                                            }`} />
                                                        {displayStatus}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-6 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-3 transition-all duration-300">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(c); }}
                                                    className="p-3 bg-white text-slate-400 hover:text-primary border border-slate-100 rounded-2xl hover:shadow-xl hover:shadow-primary-light transition-all"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                                                    className="p-3 bg-white text-slate-400 hover:text-red-600 border border-slate-100 rounded-2xl hover:shadow-xl hover:shadow-red-50 transition-all"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="sm:group-hover:hidden transition-all text-slate-300">
                                                <MoreVertical size={20} className="ml-auto" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-slate-50 rounded-[2rem]">
                                                <Ticket size={48} className="text-slate-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-black text-slate-900 uppercase tracking-widest">No Codes Found</p>
                                                <p className="text-sm font-medium text-slate-400">Kickstart your sales with a new coupon!</p>
                                            </div>
                                            <button
                                                onClick={handleAdd}
                                                className="mt-4 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-hover shadow-md shadow-violet-200 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Start Creating
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            <CouponDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                coupon={selectedCoupon}
                mode={drawerMode}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Coupons;
