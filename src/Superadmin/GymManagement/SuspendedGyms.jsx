import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Ban, AlertCircle } from 'lucide-react';
import { fetchAllGyms, toggleGymStatus } from '../../api/superadmin/superAdminApi';

const SuspendedGyms = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadSuspendedGyms();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadSuspendedGyms = async () => {
        setLoading(true);
        try {
            const data = await fetchAllGyms({
                search: searchTerm,
                status: 'Suspended',
                limit: 100 // Fetch all suspended for this view or add pagination
            });
            setGyms(data.gyms || []);
        } catch (error) {
            console.error('Error loading suspended gyms:', error);
            setGyms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (id) => {
        if (window.confirm('Are you sure you want to reactivate this gym?')) {
            try {
                await toggleGymStatus(id);
                loadSuspendedGyms();
            } catch (error) {
                alert('Failed to reactivate gym');
            }
        }
    };

    if (loading && gyms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-red-500 font-medium font-bold uppercase tracking-widest">Loading Suspended Records...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Suspended Gyms</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and manage suspended gym accounts.</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 animate-slide-up hover:bg-amber-100 hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-amber-700 transition-colors duration-300 group-hover:text-amber-800 font-medium">
                            Suspended gyms cannot access the platform. Reactivating them will grant immediate access to their dashboards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="saas-card mb-6 animate-slide-up">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="saas-input pl-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:border-red-500 focus:ring-red-500/10"
                        placeholder="Search suspended gyms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Combined View using Responsive Table */}
            <div className="saas-card p-0 overflow-hidden animate-slide-up delay-200">
                <div className="saas-table-wrapper relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Gym Detail</th>
                                <th>Contact Info</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.length > 0 ? (
                                gyms.map((gym) => (
                                    <tr key={gym.id} className="hover:bg-red-50/30 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group">
                                        <td data-label="Gym Detail">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:bg-red-200">
                                                    {(gym.gymName || '?').charAt(0)}
                                                </div>
                                                <div className="ml-4 text-left">
                                                    <div className="text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-red-600">{gym.gymName}</div>
                                                    <div className="text-sm text-gray-500">{gym.branchName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Contact Info" className="text-left text-sm text-gray-900 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Phone size={12} className="text-gray-400" />
                                                {gym.phone}
                                            </div>
                                        </td>
                                        <td data-label="Owner" className="text-left text-sm text-gray-700 font-semibold">{gym.owner}</td>
                                        <td data-label="Status">
                                            <span className="saas-badge badge-red transition-all duration-300 group-hover:scale-105 border border-red-100">
                                                <span className="badge-dot bg-red-600"></span>
                                                Suspended
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleReactivate(gym.id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-black shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-110 hover:-translate-y-0.5 transition-all duration-300 group/btn active:scale-95"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover/btn:rotate-180" />
                                                    REACTIVATE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
                                        <div className="flex flex-col items-center">
                                            <Ban className="h-12 w-12 text-gray-200 mb-4" />
                                            <p className="font-bold text-lg text-gray-400">No suspended gyms found.</p>
                                            <p className="text-sm text-gray-400 mt-1">All gym accounts are currently active.</p>
                                        </div>
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

export default SuspendedGyms;
