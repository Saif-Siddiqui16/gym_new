import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, TrendingUp, Users, Banknote, XCircle, CheckCircle, Clock, Download, FileText, ChevronRight, IndianRupee } from 'lucide-react';
import MobileCard from '../../components/common/MobileCard';
import RightDrawer from '../../components/common/RightDrawer';
import { fetchPayrollHistoryAPI } from '../../api/admin/adminApi';

const PayrollHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchPayrollHistoryAPI();
                setHistory(data);
            } catch (error) {
                console.error("Error loading payroll history:", error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const filteredRecords = history.filter(record => {
        const matchesSearch = record.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const openDrawer = (record) => {
        setSelectedEmployee(record);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedEmployee(null), 300);
    };

    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen font-sans">
            {/* Header section */}
            <div className="mb-6 sm:mb-8 relative max-w-7xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1 flex items-center gap-2">
                                <FileText className="text-violet-600" size={24} />
                                Payroll History
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm">View and manage employee payment history</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 sm:p-5 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-all duration-300" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 hover:border-slate-200 shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 z-10" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer hover:border-slate-200 shadow-sm"
                        >
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>

                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-200">
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            {/* Mobile Cards (md:hidden) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-10 font-bold text-slate-400 tracking-widest uppercase">Loading History...</div>
                ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-10 font-bold text-slate-400 tracking-widest uppercase">No records found</div>
                ) : filteredRecords.map(record => (
                    <MobileCard
                        key={record.id}
                        title={record.staffName}
                        subtitle={`${monthNames[record.month]} ${record.year}`}
                        badge={{
                            label: record.status,
                            color: record.status === 'Paid' ? 'emerald' : 'amber'
                        }}
                        fields={[
                            { label: 'Net Pay', value: `₹${Number(record.amount).toLocaleString()}`, icon: IndianRupee },
                            { label: 'Paid On', value: record.status === 'Paid' ? 'Processed' : '-', icon: Calendar },
                        ]}
                        actions={[
                            {
                                label: 'View Details',
                                icon: ChevronRight,
                                variant: 'secondary',
                                onClick: () => openDrawer(record)
                            }
                        ]}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-w-7xl mx-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">Month</th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">Net Pay</th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center font-bold text-slate-400 tracking-widest uppercase">Loading History...</td>
                            </tr>
                        ) : filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center font-bold text-slate-400 tracking-widest uppercase">No records found</td>
                            </tr>
                        ) : filteredRecords.map(record => (
                            <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openDrawer(record)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold border border-violet-200">
                                            {record.staffName?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{record.staffName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-slate-500">{monthNames[record.month]} {record.year}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-slate-900">₹{Number(record.amount).toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${record.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {record.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openDrawer(record); }}
                                        className="p-2 bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-300"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payroll Details Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Payroll Details"
                subtitle={selectedEmployee ? `${selectedEmployee.staffName} - ${monthNames[selectedEmployee.month]} ${selectedEmployee.year}` : ''}
            >
                {selectedEmployee && (
                    <div className="space-y-8">
                        {/* Header Info */}
                        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 rounded-2xl text-white shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black border border-white/30">
                                    {selectedEmployee.staffName?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{selectedEmployee.staffName}</h2>
                                    <div className="text-violet-100 text-sm font-medium">{monthNames[selectedEmployee.month]} {selectedEmployee.year} History</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-lg ${selectedEmployee.status === 'Paid' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'}`}>
                                    {selectedEmployee.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pt-6">
                                <span className="text-lg font-black text-slate-900 uppercase tracking-widest">Net Payout</span>
                                <span className="text-3xl font-black text-violet-600">₹{Number(selectedEmployee.amount).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6">
                            <button
                                onClick={closeDrawer}
                                className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default PayrollHistory;
