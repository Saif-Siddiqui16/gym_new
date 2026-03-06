import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Sparkles } from 'lucide-react';
import { membershipApi } from '../../../api/membershipApi';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import CustomDropdown from '../../../components/common/CustomDropdown';
import MembershipCard from '../components/MembershipCard';

const MembershipList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'All') params.status = statusFilter;

            const data = await membershipApi.getMembers(params);
            setMemberships(data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            toast.error('Failed to load memberships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchMembers();
        }, 300); // Debounce search

        return () => clearTimeout(debounce);
    }, [searchTerm, statusFilter]);

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-6 pb-12">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Sparkles className="text-indigo-600" size={28} />
                                Memberships
                            </h1>
                            <p className="text-gray-600 text-sm">Manage member subscriptions and plans</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/memberships/plans')}
                                className="w-full sm:w-auto px-5 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} />
                                Manage Plans
                            </button>
                            <button
                                onClick={() => navigate('/memberships/new')}
                                className="w-full sm:w-auto group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500"></div>
                                <Plus size={18} className="relative z-10 transition-transform duration-300 group-hover:rotate-90" />
                                <span className="relative z-10">Add Membership</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass Morphism Filter Bar */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-5 hover:shadow-xl transition-all duration-300 relative z-[100]">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Enhanced Search Input */}
                    <div className="relative flex-1 group">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-indigo-500 group-focus-within:scale-110"
                        />
                        <input
                            type="text"
                            placeholder="Search by Member Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="w-full sm:w-48 relative z-50">
                        <CustomDropdown
                            options={[
                                { value: 'All', label: 'All Statuses' },
                                { value: 'Active', label: 'Active' },
                                { value: 'Expired', label: 'Expired' },
                                { value: 'Frozen', label: 'Frozen' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            icon={Filter}
                            className="hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Premium Memberships Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : memberships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {memberships.map(membership => (
                        <MembershipCard key={membership.id} membership={membership} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Memberships Found</h3>
                    <p className="text-gray-500 mb-6">No memberships match your current filters.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default MembershipList;
