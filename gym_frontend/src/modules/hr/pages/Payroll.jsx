import React, { useState, useEffect } from 'react';
import { DollarSign, Download, CheckCircle, Clock, Search, Filter, Calendar, TrendingUp, Users, Banknote, XCircle, IndianRupee } from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';
import { fetchPayrollHistoryAPI, updatePayrollStatusAPI } from '../../../api/admin/adminApi';

const Payroll = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const defaultMonthStr = `${monthNames[now.getMonth() + 1]} ${now.getFullYear()}`;
    const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    // Edit State for Drawer
    const [editBonus, setEditBonus] = useState(0);
    const [editDeductions, setEditDeductions] = useState(0);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchPayrollHistoryAPI();
                // Map backend data to frontend requirements
                const mappedData = data.map(record => ({
                    id: record.id,
                    name: record.staffName,
                    baseSalary: Number(record.amount), // Fallback or use real baseSalary if added to backend
                    attendanceRate: 100, // Placeholder
                    commission: 0, // Placeholder
                    bonus: 0, // Placeholder
                    deductions: 0, // Placeholder
                    netPay: Number(record.amount),
                    status: record.status,
                    month: `${monthNames[record.month]} ${record.year}`,
                    paymentDate: record.status === 'Paid' ? 'Processed' : null
                }));
                setHistory(mappedData);
            } catch (error) {
                console.error("Error loading payroll history:", error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const currentMonthData = history.filter(r => r.month === selectedMonth) || [];
    const selectedEmployee = currentMonthData.find(e => e.id === selectedEmployeeId);

    // Sync edit state when employee changes
    useEffect(() => {
        if (selectedEmployee) {
            setEditBonus(selectedEmployee.bonus);
            setEditDeductions(selectedEmployee.deductions);
        }
    }, [selectedEmployeeId, selectedMonth, selectedEmployee]);

    const filteredPayroll = currentMonthData.filter(record => {
        const matchesSearch = record.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPayroll = currentMonthData.reduce((sum, record) => sum + record.netPay, 0);
    const paidAmount = currentMonthData.filter(r => r.status === 'Paid').reduce((sum, record) => sum + record.netPay, 0);
    const pendingAmount = currentMonthData.filter(r => r.status === 'Pending').reduce((sum, record) => sum + record.netPay, 0);
    const paidCount = currentMonthData.filter(r => r.status === 'Paid').length;
    const pendingCount = currentMonthData.filter(r => r.status === 'Pending').length;

    // Monthly Analytics
    const highestPaidEmployee = currentMonthData.length > 0
        ? [...currentMonthData].sort((a, b) => b.netPay - a.netPay)[0]
        : null;
    const totalIncentivesAmt = currentMonthData.reduce((sum, r) => sum + Number(r.bonus || 0) + Number(r.commission || 0), 0);
    const totalDeductionsAmt = currentMonthData.reduce((sum, r) => sum + Number(r.deductions || 0), 0);

    const handleSavePayroll = () => {
        // Implementation for saving adjustments if needed
        alert("Salary adjustment saved locally (integration pending)");
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await updatePayrollStatusAPI(id, { status: 'Paid' });
            setHistory(prev => prev.map(record =>
                record.id === id ? { ...record, status: 'Paid', paymentDate: 'Processed' } : record
            ));
            alert("Payroll marked as Paid!");
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const openDrawer = (employee) => {
        setSelectedEmployeeId(employee.id);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedEmployeeId(null), 300);
    };

    const getStatusColor = (status) => {
        return status === 'Paid' ? 'emerald' : 'amber';
    };

    // Get unique months from history for the selector
    const availableMonths = [...new Set(history.map(r => r.month))].sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
    });

    useEffect(() => {
        if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths]);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Banknote className="text-violet-600" size={24} />
                                Payroll Management
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm">View and process monthly staff salaries</p>
                        </div>

                        {/* Month Selector */}
                        <div className="relative group w-full sm:w-64">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 z-10" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer"
                            >
                                {availableMonths.length > 0 ? (
                                    availableMonths.map(m => <option key={m} value={m}>{m}</option>)
                                ) : (
                                    <option value={selectedMonth}>{selectedMonth}</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Total Payroll */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
                    <div className="relative p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-violet-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Payroll Cost</div>
                            <IndianRupee className="text-violet-200 opacity-50" size={20} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black mb-1">₹{totalPayroll.toLocaleString()}</div>
                        <div className="text-violet-200 text-xs sm:text-sm">For {selectedMonth}</div>
                    </div>
                </div>

                {/* Paid */}
                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Paid</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">₹{paidAmount.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs sm:text-sm">{paidCount} Staff Members</div>
                </div>

                {/* Pending */}
                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Pending</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Clock size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-orange-600 mb-1">₹{pendingAmount.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs sm:text-sm">{pendingCount} Staff Members</div>
                </div>

                {/* Total Staff */}
                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Staff</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Users size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{currentMonthData.length}</div>
                    <div className="text-slate-500 text-xs sm:text-sm">Active Employees</div>
                </div>
            </div>

            {/* Monthly Analytics Section */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <TrendingUp className="text-violet-600" size={20} />
                    <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Monthly Analytics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Highest Paid Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp size={64} className="text-violet-600" />
                        </div>
                        <div className="relative z-10 text-slate-400 text-xs font-black uppercase tracking-widest mb-3">Highest Paid</div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-lg border border-violet-200">
                                {highestPaidEmployee?.name ? highestPaidEmployee.name.charAt(0) : '?'}
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900 leading-tight">
                                    {highestPaidEmployee?.name || 'N/A'}
                                </div>
                                <div className="text-violet-600 font-bold text-sm mt-0.5">
                                    ₹{highestPaidEmployee?.netPay?.toLocaleString() || '0'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Incentives Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp size={64} className="text-emerald-600" />
                        </div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Incentives</div>
                        <div className="text-3xl font-black text-emerald-600 mb-1">
                            ₹{totalIncentivesAmt.toLocaleString()}
                        </div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">For {selectedMonth}</div>
                    </div>

                    {/* Total Deductions Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp size={64} className="text-red-600" />
                        </div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Deductions</div>
                        <div className="text-3xl font-black text-red-600 mb-1">
                            ₹{totalDeductionsAmt.toLocaleString()}
                        </div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">For {selectedMonth}</div>
                    </div>
                </div>
            </div>

            {/* Glass Morphism Filter Bar */}
            <div className="mb-4 sm:mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-4 sm:p-5 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative group">
                        <Search
                            size={18}
                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by employee name..."
                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                    </div>

                    <div className="relative group">
                        <Filter
                            size={18}
                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300 appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 sm:space-y-4 mb-6">
                {loading ? (
                    <div className="text-center py-10 font-bold text-slate-400">Loading Payrolls...</div>
                ) : filteredPayroll.length === 0 ? (
                    <div className="text-center py-10 font-bold text-slate-400">No records found</div>
                ) : (
                    filteredPayroll.map((record) => (
                        <MobileCard
                            key={record.id}
                            title={record.name}
                            badge={record.status}
                            badgeColor={getStatusColor(record.status)}
                            fields={[
                                { label: 'Base Salary', value: `₹${record.baseSalary.toLocaleString()}` },
                                { label: 'Attendance', value: `${record.attendanceRate || 0}%` },
                                { label: 'Commission', value: `₹${(record.commission || 0).toLocaleString()}` },
                                { label: 'Net Pay', value: `₹${record.netPay.toLocaleString()}` },
                            ]}
                            actions={[
                                {
                                    label: record.status === 'Paid' ? 'Paid' : 'Mark Paid',
                                    icon: record.status === 'Paid' ? CheckCircle : Banknote,
                                    onClick: () => record.status === 'Pending' ? handleMarkAsPaid(record.id) : openDrawer(record),
                                    variant: record.status === 'Paid' ? 'success' : 'primary',
                                },
                            ]}
                            onClick={() => openDrawer(record)}
                        />
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Base Salary</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Attendance</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Commission</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Net Pay</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center font-bold text-slate-400">Loading Payrolls...</td>
                                </tr>
                            ) : filteredPayroll.map((record) => (
                                <tr
                                    key={record.id}
                                    onClick={() => openDrawer(record)}
                                    className="group cursor-pointer hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-purple-50/30 hover:to-transparent transition-all duration-300"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                {(record.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors duration-300">
                                                    {record.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-700">₹{record.baseSalary.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${record.attendanceRate >= 90 ? 'bg-emerald-500' : record.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${record.attendanceRate || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{record.attendanceRate || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-indigo-600">₹{(record.commission || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 border-l border-slate-100">
                                        <span className="text-sm font-black text-slate-900">₹{record.netPay.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.status === 'Paid' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md">
                                                <CheckCircle size={14} />
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md">
                                                <Clock size={14} />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {record.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(record.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all duration-300 active:scale-95 shadow-lg shadow-violet-200"
                                                >
                                                    <CheckCircle size={14} />
                                                    Mark Paid
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openDrawer(record)}
                                                className="group/btn p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Search size={18} />
                                            </button>
                                            <button className="group/btn p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-300 hover:scale-110">
                                                <Download size={18} className="transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredPayroll.length === 0 && (
                    <div className="p-12 sm:p-16 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Banknote size={32} className="sm:w-10 sm:h-10 text-violet-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No Payroll Records Found</h3>
                        <p className="text-slate-600 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
            {/* Payroll Details Drawer */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Overlay backdrop */}
                        <div
                            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
                            aria-hidden="true"
                            onClick={closeDrawer}
                        ></div>

                        <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                            <div className={`relative w-screen sm:max-w-md transform transition-transform duration-300 ease-in-out shadow-2xl ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                                <div className="flex h-full flex-col bg-white overflow-y-auto">
                                    {/* Drawer Header */}
                                    <div className="px-6 py-8 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white relative">
                                        <button
                                            type="button"
                                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 group"
                                            onClick={closeDrawer}
                                        >
                                            <XCircle className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                                        </button>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30 shadow-xl">
                                                {(selectedEmployee?.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tight">{selectedEmployee?.name}</h2>
                                                <p className="text-violet-100 text-sm font-medium">Employee Monthly Payroll</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20 italic">
                                                {selectedMonth}
                                            </span>
                                            {selectedEmployee?.status === 'Paid' ? (
                                                <span className="px-3 py-1 bg-emerald-400 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
                                                    <CheckCircle size={12} /> PAID
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-400 text-amber-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
                                                    <Clock size={12} /> PENDING
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Salary Breakdown Section */}
                                    <div className="p-6 space-y-8 flex-1">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                <DollarSign size={14} className="text-violet-500" /> Salary Breakdown
                                            </h3>
                                            <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                                    <span className="text-sm font-medium text-slate-600">Base Salary</span>
                                                    <span className="text-sm font-bold text-slate-900">₹{(selectedEmployee?.baseSalary || 0).toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                                    <span className="text-sm font-medium text-slate-600">Attendance</span>
                                                    <span className="text-sm font-bold text-slate-900">{selectedEmployee?.attendanceRate || 0}%</span>
                                                </div>

                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                                    <span className="text-sm font-medium text-slate-600">Commission</span>
                                                    <span className="text-sm font-bold text-indigo-600">₹{(selectedEmployee?.commission || 0).toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                                    <span className="text-sm font-medium text-slate-600">Incentives / Bonus</span>
                                                    <span className="text-sm font-bold text-emerald-600">+₹{(selectedEmployee?.bonus || 0).toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                                    <span className="text-sm font-medium text-slate-600">Deductions</span>
                                                    <span className="text-sm font-bold text-red-600">-₹{(selectedEmployee?.deductions || 0).toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-base font-black text-slate-900">Net Pay</span>
                                                    <span className="text-2xl font-black text-violet-600">
                                                        ₹{(selectedEmployee?.netPay || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                {selectedEmployee?.status === 'Paid' && (
                                                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
                                                        Salary Locked After Payment
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                <Banknote size={14} className="text-violet-500" /> Payment Information
                                            </h3>
                                            <div className={`rounded-2xl p-5 border-2 ${selectedEmployee?.status === 'Paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                                {selectedEmployee?.status === 'Paid' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-emerald-900 leading-tight">Paid Successfully</div>
                                                            <div className="text-xs font-medium text-emerald-700 mt-0.5">Payment Date: {selectedEmployee.paymentDate || 'Today'}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900 leading-tight">Payment Outstanding</div>
                                                            <div className="text-xs font-medium text-slate-500 mt-0.5">Not Processed Yet</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                                        {selectedEmployee?.status === 'Pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleMarkAsPaid(selectedEmployee.id)}
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 text-white rounded-xl font-bold shadow-xl shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                                >
                                                    <Banknote size={20} />
                                                    Confirm Payment & Mark Paid
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-100 text-emerald-600 rounded-xl font-bold border-2 border-emerald-200 cursor-not-allowed opacity-80"
                                            >
                                                <CheckCircle size={20} />
                                                Payroll Processed
                                            </button>
                                        )}
                                        <p className="text-center text-[10px] text-slate-400 mt-2 leading-relaxed tracking-wide uppercase font-bold">
                                            This action will be recorded in the system audit logs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
