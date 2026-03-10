import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Download, ChevronRight, Eye, Calendar, Clock, CheckCircle, Plus, Users, User, SearchIcon, ReceiptText } from 'lucide-react';
import { getStoreOrders } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import { exportPdf } from '../../utils/exportPdf';

const StoreOrders = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const data = await getStoreOrders({ branchId: branchParam });
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedBranch]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.memberName || 'Guest').toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm);
        const matchesStatus = filterStatus === '' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        if (filteredOrders.length === 0) return toast.error('No orders to export');

        const headers = ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'];
        const rows = filteredOrders.map(o => [
            `#${o.id.toString().padStart(6, '0')}`,
            o.member?.name || o.guestName || 'Guest',
            o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
            o.itemsCount ? o.itemsCount.toString() : '0',
            `₹${(o.totalAmount || 0).toLocaleString()}`,
            o.status
        ]);

        exportPdf({
            title: 'Store Orders Report',
            filename: `store_orders_${new Date().toISOString().split('T')[0]}`,
            headers,
            rows,
            gymName: "Gym Academy"
        });
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-primary-light/20 p-4 sm:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <ShoppingCart size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight">
                            Store Orders
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Track and manage customer orders and sales</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:bg-primary-hover transition-all active:scale-95">
                        <Download size={18} /> Export as PDF
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white shadow-lg">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Orders</p>
                        <h3 className="text-2xl font-black text-slate-900">{orders.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pending</p>
                        <h3 className="text-2xl font-black text-amber-600">{orders.filter(o => o.status === 'Pending').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                        <h3 className="text-2xl font-black text-emerald-600">{orders.filter(o => o.status === 'Completed').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg">
                        <ReceiptText size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-2xl font-black text-primary">₹{orders.reduce((acc, o) => acc + parseFloat(o.totalAmount), 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">Fetching orders...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest text-left">
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-8 py-5">Customer</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Items</th>
                                    <th className="px-8 py-5">Total</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map(o => (
                                    <tr key={o.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-6 text-sm font-black text-slate-900 group-hover:text-primary transition-colors">#{o.id.toString().padStart(6, '0')}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-light group-hover:text-primary transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{o.member?.name || o.guestName || 'Guest'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(o.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tight italic">
                                                {o.itemsCount} Items
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-900">₹{parseFloat(o.totalAmount).toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : o.status === 'Processing' ? 'bg-primary-light text-primary border border-violet-100' : o.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${o.status === 'Completed' ? 'bg-emerald-500' : o.status === 'Processing' ? 'bg-primary' : o.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(o);
                                                    setShowModal(true);
                                                }}
                                                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                            <ReceiptText size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">No orders found</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-8">Customer orders will appear here once placed</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                    <ReceiptText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Details</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">#{selectedOrder.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 max-h-[70vh] ">
                            {/* Order Info Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Info</p>
                                        <h4 className="font-black text-slate-900">{selectedOrder.memberName || selectedOrder.guestName || 'Guest Customer'}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{selectedOrder.guestPhone || 'No phone number'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                                        <p className="text-sm font-black text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-400 font-medium">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Purchased</p>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                    <ShoppingCart size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{item.productName}</p>
                                                    <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-900">₹{item.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                                <div className="flex justify-between items-center bg-gradient-to-r from-primary to-primary p-6 rounded-2xl text-white shadow-xl shadow-violet-200">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <ReceiptText size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-100">Total Amount</p>
                                            <p className="text-xs text-violet-200 font-medium mt-0.5">Included Taxes & Fees</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black tracking-tight drop-shadow-sm">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreOrders;
