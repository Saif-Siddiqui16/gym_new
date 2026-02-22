import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Filter, ArrowUpRight } from 'lucide-react';
import { getMembers, getMemberStats } from '../../api/manager/managerApi';
import '../../styles/GlobalDesign.css';

const MemberStatus = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setLoading(true);
        const [memberData, statData] = await Promise.all([
            getMembers({ filters: { status: statusFilter === 'All' ? '' : statusFilter }, limit: 100 }),
            getMemberStats()
        ]);

        setMembers(memberData?.data || []);

        if (statData) {
            setStats([
                { title: 'Total Members', value: (statData.total || 0).toLocaleString(), change: statData.trends?.total || '0%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                { title: 'Active Members', value: (statData.active || 0).toLocaleString(), change: statData.trends?.active || '0%', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
                { title: 'Expired Members', value: (statData.expired || 0).toLocaleString(), change: statData.trends?.expired || '0%', icon: Clock, color: 'text-red-600', bg: 'bg-red-100' },
                { title: 'Inactive Members', value: (statData.inactive || 0).toLocaleString(), change: statData.trends?.inactive || '0%', icon: UserX, color: 'text-gray-600', bg: 'bg-gray-100' },
            ]);
        }

        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Expired': return 'bg-red-100 text-red-800';
            case 'Inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Member Status</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of member status and subscription health.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
                {stats.map((stat, index) => (
                    <div key={index}
                        className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {/* Decorative Background Blob */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out blur-2xl`}></div>

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} flex items-center gap-1`}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : null}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                        <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wide">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Status Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">Status Breakdown</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0 bg-gray-50/50 p-1.5 rounded-xl border border-gray-100">
                        {['All', 'Active', 'Expired', 'Inactive'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative overflow-hidden whitespace-nowrap flex-shrink-0 ${statusFilter === status
                                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5 transform scale-100'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="saas-table-wrapper border-0 rounded-none">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membership Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading status data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-indigo-50/50 transition-colors duration-200 group cursor-pointer">
                                        <td className="px-4 md:px-6 py-4 md:whitespace-nowrap" data-label="Member Name">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm md:text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                                <div className="text-sm md:text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{member.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 md:whitespace-nowrap" data-label="Membership Plan">
                                            <div className="text-sm text-gray-600">{member.plan}</div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 md:whitespace-nowrap" data-label="Current Status">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 md:whitespace-nowrap text-sm text-gray-500" data-label="Expiry Date">
                                            {member.expiryDate || member.expiry}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No members found for this status.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MemberStatus;
