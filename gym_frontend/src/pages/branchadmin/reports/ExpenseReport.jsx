import React, { useState } from 'react';
import { Receipt, Download, Filter, Search, Calendar, CreditCard, ShoppingBag, Zap, PieChart } from 'lucide-react';
import '../../../styles/GlobalDesign.css';

const ExpenseReport = () => {
    const [selectedDate, setSelectedDate] = useState('2024-03-01');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = [
        { label: 'Total Expenses', value: '₹1,24,500', icon: CreditCard, bg: 'bg-rose-50', color: 'text-rose-600' },
        { label: 'Operational Costs', value: '₹82,000', icon: Zap, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Supplies/Inventory', value: '₹42,500', icon: ShoppingBag, bg: 'bg-amber-50', color: 'text-amber-600' },
    ];

    const expenseData = [
        { id: 1, date: '2024-03-05', category: 'Utilities', description: 'Electricity Bill - Feb', amount: '₹15,400', status: 'Paid' },
        { id: 2, date: '2024-03-08', category: 'Maintenance', description: 'AC Servicing (8 units)', amount: '₹12,000', status: 'Paid' },
        { id: 3, date: '2024-03-12', category: 'Inventory', description: 'Protein Supplements Stock', amount: '₹22,500', status: 'Pending' },
        { id: 4, date: '2024-03-15', category: 'Marketing', description: 'Social Media Ads', amount: '₹8,000', status: 'Paid' },
    ];

    const handleExport = () => {
        alert("Preparing your expense report export... The CSV file will be ready for download shortly.");
        // Logic for generating CSV would go here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Receipt size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Expense Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Track operational expenditures and overhead costs</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl hover:shadow-rose-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Download size={18} />
                            Export Expenses
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} shadow-md`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-rose-500 transition-all bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 rounded-xl text-pink-700 text-xs font-bold">
                                <PieChart size={14} />
                                Category Distribution
                            </div>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-rose-500 text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenseData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-rose-600">{row.category}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{row.description}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{row.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReport;
