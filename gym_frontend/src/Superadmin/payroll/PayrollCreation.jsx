import React, { useState, useEffect } from 'react';
import { FilePlus, XCircle, Banknote, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { fetchPayrollStaffAPI, createPayrollAPI } from '../../api/admin/adminApi';

const PayrollCreation = ({ role = ROLES.SUPER_ADMIN }) => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [month, setMonth] = useState('January');
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear.toString());
    const [incentives, setIncentives] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await fetchPayrollStaffAPI();
                // If it's a Branch Admin or Manager, the API already filters by tenantId.
                setStaffList(data);
                console.log("Loaded Staff List:", data); // Debugging
            } catch (error) {
                console.error("Error loading staff for payroll:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStaff();
    }, []);

    const selectedStaff = staffList.find(s => s.id === parseInt(selectedStaffId));

    // Ensure baseSalary is treated as a number. Prisma Decimal comes as string or decimal object.
    const getBaseSalary = () => {
        if (!selectedStaff) return 0;
        const val = selectedStaff.baseSalary;
        return val ? Number(val) : 0;
    };

    const baseSalary = getBaseSalary();
    const netSalary = Number(baseSalary) + Number(incentives) - Number(deductions);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStaffId) {
            alert("Please select a staff member");
            return;
        }

        const payrollData = {
            staffId: selectedStaffId,
            month,
            year,
            amount: netSalary,
            status
        };

        try {
            await createPayrollAPI(payrollData);
            alert("Payroll created successfully!");
            navigate('/superadmin/payroll/history');
        } catch (error) {
            console.error("Error creating payroll:", error);
            alert("Failed to create payroll: " + (error.response?.data?.message || error.message));
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 flex justify-between items-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
                            Create Payroll
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Assign salary, incentives, deductions, and mark as paid</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center text-white shadow-lg shadow-violet-200">
                        <FilePlus size={28} />
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Section 1: Staff & Period */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Select Staff</label>
                                <div className="relative group">
                                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 z-10" />
                                    <select
                                        required
                                        disabled={loading}
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer"
                                    >
                                        <option value="">{loading ? 'Loading...' : 'Choose Employee'}</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Month</label>
                                <div className="relative group">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 z-10" />
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer"
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Year</label>
                                <div className="relative group">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 z-10" />
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer"
                                    >
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y.toString()}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Salary Breakdown */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Banknote className="text-violet-600" size={20} />
                                <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">Salary Calculation</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Salary</label>
                                    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 shadow-inner">
                                        ₹{Number(baseSalary).toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Incentives</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black">+₹</span>
                                        <input
                                            type="number"
                                            value={incentives}
                                            onChange={(e) => setIncentives(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black text-emerald-600 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deductions</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 font-black">-₹</span>
                                        <input
                                            type="number"
                                            value={deductions}
                                            onChange={(e) => setDeductions(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black text-red-600 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Final Net Salary</span>
                                    <span className="text-4xl font-black text-violet-600 tracking-tighter shadow-violet-100">₹{netSalary.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-4 bg-white p-2 border-2 border-slate-100 rounded-2xl shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('Paid')}
                                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${status === 'Paid' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <CheckCircle size={16} /> PAID
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('Pending')}
                                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${status === 'Pending' ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Clock size={16} /> PENDING
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <CheckCircle size={24} /> Confirm & Create Payroll
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-10 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <XCircle size={24} /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PayrollCreation;
