import React, { useState, useEffect } from 'react';
import { fetchStaffMembers } from '../../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';
import { Users, Search, Filter, Calendar, Clock, User, Shield, Briefcase } from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';

const StaffSchedule = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await fetchStaffMembers();
            const formatted = data.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role.charAt(0) + s.role.slice(1).toLowerCase(),
                shift: 'Full Day (9AM - 6PM)', // Mocking shift as its not in DB currently
                status: s.status === 'Active' ? 'On Duty' : 'Off Duty'
            }));
            setStaffList(formatted);
        } catch (error) {
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === '' || staff.role === filterRole || staff.role.toUpperCase() === filterRole.toUpperCase();
        const matchesStatus = filterStatus === '' || staff.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'On Duty': 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200',
            'On Leave': 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200',
            'Off Duty': 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md ${styles[status] || styles['Off Duty']}`}>
                {status}
            </span>
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            'On Duty': 'emerald',
            'On Leave': 'red',
            'Off Duty': 'slate',
        };
        return colors[status] || 'slate';
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Users className="text-violet-600 flex-shrink-0" size={24} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Staff Schedule
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse flex-shrink-0">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage staff shifts and availability</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass Morphism Filter Bar */}
            <div className="mb-4 sm:mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-4 sm:p-5 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="relative group">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or role..."
                            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                    </div>

                    <div className="relative group">
                        <Filter
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10"
                        />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300 appearance-none cursor-pointer"
                        >
                            <option value="">All Roles</option>
                            <option value="Trainer">Trainer</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Cleaner">Cleaner</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <Shield
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300 appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="On Duty">On Duty</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Off Duty">Off Duty</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 sm:space-y-4 mb-6">
                {filteredStaff.map((staff) => (
                    <MobileCard
                        key={staff.id}
                        title={staff.name}
                        subtitle={staff.role}
                        badge={staff.status}
                        badgeColor={getStatusColor(staff.status)}
                        fields={[
                            { label: 'Shift', value: staff.shift, icon: Clock },
                        ]}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Staff Member</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Shift</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStaff.map((staff) => (
                                <tr
                                    key={staff.id}
                                    className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-purple-50/30 hover:to-transparent transition-all duration-300 cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                {(staff.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors duration-300">
                                                    {staff.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:from-violet-50 group-hover:to-purple-50 group-hover:text-violet-700 group-hover:border-violet-200 transition-all duration-300">
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:scale-125" />
                                            {staff.shift}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(staff.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStaff.length === 0 && (
                    <div className="p-12 sm:p-16 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Users size={32} className="sm:w-10 sm:h-10 text-violet-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No Staff Found</h3>
                        <p className="text-slate-600 text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Mobile Empty State */}
            {filteredStaff.length === 0 && (
                <div className="md:hidden bg-white rounded-xl shadow-xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Users size={32} className="text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Staff Found</h3>
                    <p className="text-slate-600 text-sm">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
};

export default StaffSchedule;
