import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Filter, MoreVertical, Mail, Phone, Briefcase, DollarSign, Edit } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import MobileCard from '../../../components/common/MobileCard';
import { STAFF_LIST } from '../data/mockHR';

const StaffList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    const filteredStaff = STAFF_LIST.filter(staff =>
        (departmentFilter === 'All' || staff.department === departmentFilter) &&
        (staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const departments = ['All', 'Training', 'Sales', 'Housekeeping', 'Operations'];

    return (
        <div className="fade-in space-y-4 sm:space-y-6 p-4 sm:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Staff Directory</h2>
                    <p className="text-gray-500 font-bold mt-1 text-sm sm:text-base">Manage employees, roles, and departments.</p>
                </div>
            </div>

            <Card>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name or role..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setDepartmentFilter(dept)}
                                className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border ${departmentFilter === dept
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 sm:space-y-4">
                    {filteredStaff.map(staff => (
                        <MobileCard
                            key={staff.id}
                            title={staff.name}
                            subtitle={`${staff.role} • ${staff.id}`}
                            badge={staff.department}
                            badgeColor={staff.status === 'Active' ? 'emerald' : 'orange'}
                            fields={[
                                {
                                    label: 'Salary',
                                    value: `₹${staff.salary.toLocaleString()}${staff.commission > 0 ? ` (+${staff.commission}% Comm.)` : ''}`,
                                    icon: DollarSign
                                },
                                {
                                    label: 'Status',
                                    value: staff.status,
                                    icon: Briefcase
                                },
                            ]}
                            actions={[
                                { label: 'View Details', onClick: () => console.log('View', staff.id) },
                                { label: 'Edit', onClick: () => navigate(`/hr/staff/edit/${staff.id}`) },
                            ]}
                        />
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 font-black text-gray-400 text-xs uppercase tracking-wider pl-4">Staff Member</th>
                                <th className="pb-4 font-black text-gray-400 text-xs uppercase tracking-wider">Department</th>
                                <th className="pb-4 font-black text-gray-400 text-xs uppercase tracking-wider">Salary</th>
                                <th className="pb-4 font-black text-gray-400 text-xs uppercase tracking-wider">Status</th>
                                <th className="pb-4 font-black text-gray-400 text-xs uppercase tracking-wider text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStaff.map(staff => (
                                <tr key={staff.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{staff.name}</div>
                                                <div className="text-xs text-gray-400">{staff.role} • {staff.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                                            {staff.department}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-bold text-gray-900">₹{staff.salary.toLocaleString()}</div>
                                        {staff.commission > 0 && (
                                            <div className="text-xs text-emerald-600 font-bold">+{staff.commission}% Comm.</div>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${staff.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <button
                                            onClick={() => navigate(`/hr/staff/edit/${staff.id}`)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Staff"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredStaff.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Staff Found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StaffList;
