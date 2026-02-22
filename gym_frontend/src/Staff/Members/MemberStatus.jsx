import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Search, Filter, MoreVertical, Eye, RefreshCw, ChevronRight } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import { getMembers, getMemberStats } from '../../api/staff/memberApi';
import '../../styles/GlobalDesign.css';

const MemberStatus = () => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [memberData, statData] = await Promise.all([
                getMembers(),
                getMemberStats()
            ]);
            setMembers(memberData);

            if (statData) {
                setStats([
                    { label: 'Total Members', value: statData.total.toLocaleString(), icon: Clock, bg: 'bg-indigo-50', color: 'text-indigo-600' }, // Changed from Users
                    { label: 'Active', value: statData.active.toLocaleString(), icon: UserCheck, bg: 'bg-green-50', color: 'text-green-600' },
                    { label: 'Expired', value: statData.expired.toLocaleString(), icon: Clock, bg: 'bg-red-50', color: 'text-red-600' }, // Changed from AlertCircle
                    { label: 'Inactive', value: statData.inactive.toLocaleString(), icon: UserX, bg: 'bg-gray-100', color: 'text-gray-600' },
                ]);
            }
        } catch (error) {
            console.error("Failed to load member status data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.plan.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700">ACTIVE</span>;
            case 'Inactive': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600">INACTIVE</span>;
            case 'Expired': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700">EXPIRED</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-memberstatus">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Member Status</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of membership distributions and current validity status.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array(4).fill(0).map((_, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-24"></div>
                    ))
                ) : (
                    stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 staffdashboard-memberstatus-card active:scale-[0.98] cursor-pointer group">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 leading-tight group-hover:scale-110 transition-transform">{stat.value}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-3 w-full md:w-auto">
                        <CustomDropdown
                            options={['All', 'Active', 'Inactive', 'Pending', 'Expired']}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            placeholder="All Status"
                            icon={Filter}
                            className="w-48"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="saas-input pl-10 h-10 w-full rounded-lg border-gray-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-md transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>Expiry Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading members...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length > 0 ? (
                                filteredMembers.map((row) => (
                                    <tr key={row.id} className="hover:bg-indigo-50/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group hover:shadow-md">
                                        <td data-label="Member Name">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">{row.name}</p>
                                        </td>
                                        <td data-label="Plan">
                                            <p className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">{row.plan}</p>
                                        </td>
                                        <td data-label="Status">
                                            {getStatusBadge(row.status)}
                                        </td>
                                        <td data-label="Expiry Date">
                                            <p className={`text-xs font-bold ${row.status === 'Expired' ? 'text-red-500' : 'text-gray-600'}`}>
                                                {row.expiry}
                                            </p>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No members found matching your filters.
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
