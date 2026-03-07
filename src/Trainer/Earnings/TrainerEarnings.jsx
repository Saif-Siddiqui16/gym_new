import React, { useState, useEffect } from 'react';
import {
    Banknote,
    TrendingUp,
    Calendar,
    Users,
    FileText,
    Info,
    Clock,
} from 'lucide-react';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import DashboardGrid from '../../modules/dashboard/components/DashboardGrid';
import Card from '../../components/ui/Card';
import * as trainerApi from '../../api/trainer/trainerApi';
import { toast } from 'react-hot-toast';

// Component for the printable document (hidden on screen, visible during print)
const PrintablePayslip = ({ data, activeMonthData }) => {
    if (!data || !activeMonthData) return null;

    return (
        <div className="hidden print:block printable-payslip-content p-16 bg-white min-h-screen">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">{data.summary.branchName || "Main Branch"}</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Employee Salary Statement</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-900 font-black text-lg">SALARY SLIP</p>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-tight">Official Record</p>
                </div>
            </div>

            <div className="w-full h-1 bg-slate-900 mb-10" />

            <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-12 text-left">
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Employee Name</span>
                    <span className="text-slate-900 font-bold text-base">{data.summary.trainerName}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Employee Code</span>
                    <span className="text-slate-900 font-bold text-base">{data.summary.trainerCode}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Department</span>
                    <span className="text-slate-900 font-bold text-base">{data.summary.department}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Designation</span>
                    <span className="text-slate-900 font-bold text-base">{data.summary.position}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pay Period</span>
                    <span className="text-slate-900 font-bold text-base">{activeMonthData.month}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</span>
                    <span className="text-slate-900 font-bold text-base">Bank Transfer</span>
                </div>
            </div>

            <table className="w-full mb-12 border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-900">
                        <th className="py-4 text-left font-black text-slate-900 uppercase tracking-widest text-[10px]">Earnings Description</th>
                        <th className="py-4 text-right font-black text-slate-900 uppercase tracking-widest text-[10px]">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-left">
                    <tr>
                        <td className="py-5 text-sm font-bold text-slate-700">Monthly Base Salary</td>
                        <td className="py-5 text-right text-sm font-black text-slate-900">{activeMonthData.baseSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="py-5 text-sm font-bold text-slate-700">
                            PT Session Payouts
                            <span className="block text-[10px] text-slate-400 font-medium">({activeMonthData.sessionCount} sessions @ ₹{activeMonthData.sessionRate}/session)</span>
                        </td>
                        <td className="py-5 text-right text-sm font-black text-slate-900">{activeMonthData.sessionEarnings.toLocaleString()}</td>
                    </tr>
                    {activeMonthData.commission > 0 && (
                        <tr>
                            <td className="py-5 text-sm font-bold text-slate-700">Monthly Performance Bonus / Commission</td>
                            <td className="py-5 text-right text-sm font-black text-slate-900">{activeMonthData.commission.toLocaleString()}</td>
                        </tr>
                    )}
                    <tr className="bg-slate-50">
                        <td className="py-5 text-sm font-black text-slate-900 uppercase tracking-wide">Gross Total Earnings</td>
                        <td className="py-5 text-right text-sm font-black text-slate-900">
                            {(activeMonthData.baseSalary + activeMonthData.sessionEarnings + activeMonthData.commission).toLocaleString()}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-5 text-sm font-bold text-red-600 italic">Deductions: Provident Fund (PF) 12%</td>
                        <td className="py-5 text-right text-sm font-black text-red-600 -tracking-tighter italic">
                            -{activeMonthData.pfDeduction.toLocaleString()}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="border-t-4 border-slate-900">
                        <td className="py-8 text-xl font-black text-slate-900 uppercase tracking-tight">Net Payable Amount</td>
                        <td className="py-8 text-right text-3xl font-black text-slate-900 tracking-tighter">
                            ₹{activeMonthData.total.toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="flex justify-between items-end mt-24">
                <div className="text-left">
                    <div className="w-48 h-px bg-slate-300 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Employer Signature</p>
                </div>
                <div className="text-right">
                    <div className="w-48 h-px bg-slate-300 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Employee Signature</p>
                </div>
            </div>

            <div className="text-center mt-20 pt-8 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                    This is a computer generated document and does not require a physical signature.<br />
                    Generated on {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
};

const TrainerEarnings = () => {
    const [activeMonth, setActiveMonth] = useState('');
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState(null);

    useEffect(() => {
        loadEarnings();
    }, []);

    const loadEarnings = async () => {
        try {
            setLoading(true);
            const data = await trainerApi.getTrainerEarnings();
            setEarningsData(data);
            if (data.history.length > 0) {
                setActiveMonth(data.history[0].month);
            }
        } catch (error) {
            console.error('Failed to load earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-tight">Loading your earnings...</p>
        </div>
    );

    const activeMonthData = earningsData?.history.find(h => h.month === activeMonth) || earningsData?.history[0];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="saas-container space-y-8 fade-in   scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative">

            {/* Printable Payslip Structure */}
            <PrintablePayslip data={earningsData} activeMonthData={activeMonthData} />

            {/* Header Section */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 print:hidden">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                        My Earnings
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-light text-primary rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-violet-100">Trainer Portal</span>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                            Track your sessions and earnings
                        </p>
                    </div>
                </div>
            </div>

            {/* Month Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-2xl w-full sm:w-fit print:hidden overflow-x-auto no-scrollbar scrollbar-hide">
                {earningsData?.history.map((item) => (
                    <button
                        key={item.month}
                        onClick={() => setActiveMonth(item.month)}
                        className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeMonth === item.month
                            ? 'bg-white text-primary shadow-lg shadow-violet-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {item.month}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="print:hidden">
                <DashboardGrid>
                    <StatsCard
                        title="Completed Sessions"
                        value={activeMonthData?.sessionCount || 0}
                        subtitle={activeMonthData?.month}
                        icon={Calendar}
                        color="primary"
                    />
                    <StatsCard
                        title="Session Rate"
                        value={`₹${activeMonthData?.sessionRate || 0}`}
                        subtitle="Per session"
                        icon={Banknote}
                        color="success"
                    />
                    <StatsCard
                        title="Estimated Earnings"
                        value={`₹${activeMonthData?.sessionEarnings || 0}`}
                        subtitle="From sessions"
                        icon={TrendingUp}
                        color="info"
                    />
                    <StatsCard
                        title="Commissions"
                        value={`₹${activeMonthData?.commission || 0}`}
                        subtitle="Package sales"
                        icon={Users}
                        color="warning"
                    />
                </DashboardGrid>
            </div>

            {/* Total Section & Payslip */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:hidden">
                <Card className="lg:col-span-2  space-y-6 md:space-y-8 border-2 border-slate-100 shadow-xl shadow-slate-100/20">
                    <div className="text-left">
                        <div className="space-y-2">
                            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Total Estimated Earnings — {activeMonthData?.month}
                            </h3>
                            <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic">₹{activeMonthData?.total || 0}</p>
                        </div>
                    </div>
                    <div className="pt-6 md:pt-8 border-t-2 border-slate-50 text-left">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Breakdown</h4>
                            <div className="p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 font-bold text-[11px] md:text-sm text-slate-600 leading-relaxed text-left flex items-center overflow-x-auto no-scrollbar whitespace-nowrap">
                                <span>Base: <span className="text-slate-900">₹{activeMonthData?.baseSalary || 0}</span> +
                                    Sessions: <span className="text-slate-900">₹{activeMonthData?.sessionEarnings || 0}</span> +
                                    Commission: <span className="text-slate-900">₹{activeMonthData?.commission || 0}</span> −
                                    PF: <span className="text-red-500 font-black">₹{activeMonthData?.pfDeduction || 0}</span></span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="flex flex-col items-center text-center  border-2 border-violet-100 shadow-xl shadow-violet-100/20 bg-gradient-to-br from-white to-primary-light/10">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-primary shadow-lg border border-primary-light mb-4 md:mb-6 transform hover:scale-110 transition-transform">
                        <FileText size={28} className="md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-widest mb-1 md:mb-2">Payslip</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 md:mb-8 px-2 md:px-4">Detailed breakdown of your monthly payouts</p>
                    <button
                        onClick={handlePrint}
                        className="w-full h-11 md:h-12 bg-primary !text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg shadow-violet-100 hover:bg-primary-hover hover:-translate-y-1 transition-all"
                    >
                        Download Payslip
                    </button>
                </Card>
            </div>

            {/* Completed Sessions Section */}
            <div className="space-y-4 md:space-y-6 print:hidden">
                <div className="flex items-center gap-3 px-1 text-left">
                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                        <Clock size={16} />
                    </div>
                    <h2 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-widest">Completed Sessions — {activeMonthData?.month}</h2>
                </div>

                <Card className="py-16 md:py-24 flex flex-col items-center justify-center text-slate-400 bg-white border-2 border-dashed border-slate-100 rounded-2xl md:rounded-[2rem]">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <Calendar size={24} strokeWidth={1} className="md:w-8 md:h-8 opacity-20" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 px-6 text-center">
                        {activeMonthData?.sessionCount > 0
                            ? `You have ${activeMonthData.sessionCount} completed sessions in ${activeMonthData.month}`
                            : "No completed sessions this month"
                        }
                    </p>
                </Card>
            </div>

            {/* Information Card */}
            <div className=" bg-primary-light rounded-2xl md:rounded-[2rem] border border-violet-100 text-left print:hidden shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-violet-100 shrink-0">
                        <Info size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-lg font-black text-violet-900 tracking-tight mb-1 md:mb-2 uppercase">Earnings Calculation</h3>
                        <p className="text-[9px] md:text-xs text-primary/80 font-bold leading-relaxed max-w-full uppercase tracking-widest">
                            Earnings shown are estimates based on completed sessions and base salary. Final payment may vary based on commission structure, deductions, and company policies. Download your payslip for detailed breakdown.
                        </p>
                    </div>
                </div>
            </div>

            {/* Typography & Custom Print standard mapping */}
            {/* Custom Print styles */}
            <style>{`
                @media print {
                    @page { 
                        margin: 0; 
                    }
                    body {
                        background: white !important;
                        margin: 0;
                    }
                    .saas-container {
                        overflow: visible !important;
                        height: auto !important;
                        padding: 0 !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .printable-payslip-content {
                        display: block !important;
                        padding: 2cm !important; /* Re-add margins internally */
                        min-height: 100vh;
                    }
                }
            `}</style>
        </div>
    );
};

export default TrainerEarnings;
