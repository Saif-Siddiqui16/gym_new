import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Download, ChevronRight, Eye, Calendar, Clock, CheckCircle, Plus, Users, User, SearchIcon } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';

const dummyOrders = [
    { id: 'ORD-1021', customer: 'John Doe', date: '11 Feb 2025', total: 4500, status: 'Completed', items: 2 },
    { id: 'ORD-1022', customer: 'Jane Smith', date: '10 Feb 2025', total: 1200, status: 'Processing', items: 1 },
    { id: 'ORD-1023', customer: 'Robert Brown', date: '09 Feb 2025', total: 5000, status: 'Pending', items: 3 },
    { id: 'ORD-1024', customer: 'Emily White', date: '08 Feb 2025', total: 2500, status: 'Cancelled', items: 1 },
];

const StoreOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [orderType, setOrderType] = useState('Guest'); // 'Member' or 'Guest'
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    const filteredOrders = dummyOrders.filter(o => {
        const matchesSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
        const matchesStatus = filterStatus === '' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <ShoppingCart className="text-slate-800" size={28} />
                        Store Orders
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Track and manage customer orders and sales</p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Add New Order
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        <Download size={18} /> Export Orders
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Order ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Items</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Total</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length > 0 ? filteredOrders.map(o => (
                            <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-black text-slate-900">{o.id}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{o.customer}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">{o.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{o.items}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900">₹{o.total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : o.status === 'Processing' ? 'bg-blue-50 text-blue-600' : o.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-bold italic">No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">{o.id}</h3>
                                <p className="text-xs text-slate-500 font-bold mt-1">{o.customer}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {o.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Date</p>
                                <p className="text-xs font-bold text-slate-700">{o.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total</p>
                                <p className="text-sm font-black text-slate-900">₹{o.total.toLocaleString()}</p>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs flex items-center justify-center gap-2">
                            <Eye size={14} /> View Order Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Checkout Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Create New Order"
                subtitle="Checkout Process"
                footer={
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                                <CheckCircle size={14} />
                                Invoice will be generated upon confirmation.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                console.log("Confirming Order for", orderType === 'Member' ? selectedMember?.name : 'Guest');
                                setIsDrawerOpen(false);
                            }}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                        >
                            Confirm Order
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    {/* Order Type Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Order Type</label>
                        <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setOrderType('Guest')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${orderType === 'Guest' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <User size={14} /> GUEST
                            </button>
                            <button
                                onClick={() => setOrderType('Member')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${orderType === 'Member' ? 'bg-white text-violet-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users size={14} /> MEMBER
                            </button>
                        </div>
                    </div>

                    {/* Member Search - Conditional */}
                    {orderType === 'Member' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Member</label>
                            <div className="relative group">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-all" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter member name or ID..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                                />
                            </div>
                            {/* Dummy search results could be shown here */}
                            {memberSearch.length > 2 && (
                                <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 text-xs font-bold text-violet-600 italic">
                                    Member: Dipanshu Patidar (#M-9021)
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guest Information */}
                    {orderType === 'Guest' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Guest Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold transition-all focus:outline-none focus:border-slate-900"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="+91 00000 00000"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold transition-all focus:outline-none focus:border-slate-900"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </RightDrawer>
        </div>
    );
};

export default StoreOrders;
