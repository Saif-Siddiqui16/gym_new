import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Eye, Ban, Trash2, MapPin, Phone } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import AddGymDrawer from './AddGymDrawer';
import { fetchAllGyms, deleteGym, toggleGymStatus, exportTable } from '../../api/superadmin/superAdminApi';

const AllGyms = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState(null);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGyms, setTotalGyms] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadGyms();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, page]);

    const loadGyms = async () => {
        setLoading(true);
        try {
            const data = await fetchAllGyms({
                search: searchTerm,
                status: filterStatus,
                page,
                limit: 10
            });
            // Backend returns { gyms, total, page, totalPages }
            setGyms(data.gyms || []);
            setTotalPages(data.totalPages || 1);
            setTotalGyms(data.total || 0);
        } catch (error) {
            console.error('Error loading gyms:', error);
            setGyms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gym?')) {
            try {
                await deleteGym(id);
                loadGyms();
            } catch (error) {
                alert('Failed to delete gym');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleGymStatus(id);
            loadGyms();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleExport = () => {
        exportTable('Gyms');
    };

    const handleView = (gym) => {
        setSelectedGym(gym);
        setIsViewDrawerOpen(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading && gyms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading Gym Data...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gym Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all gym branches and their statuses ({totalGyms} total).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                    >
                        <Download className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                        Export
                    </button>
                    <button
                        onClick={() => setIsAddDrawerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-sm group"
                    >
                        <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                        Add New Gym
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="saas-card mb-6 animate-slide-up">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="saas-input pl-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                            placeholder="Search gyms, branches..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Active', 'Suspended'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilterStatus(status);
                                    setPage(1); // Reset to first page on filter
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap hover:scale-105 hover:-translate-y-0.5 ${filterStatus === status
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm border border-transparent'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Combined View using Responsive Table */}
            <div className="saas-card p-0 overflow-hidden animate-slide-up delay-200">
                <div className="saas-table-wrapper relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Gym Detail</th>
                                <th>Contact Info</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.length > 0 ? (
                                gyms.map((gym) => (
                                    <tr key={gym.id} className="hover:bg-indigo-50/30 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group">
                                        <td data-label="Gym Detail">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg">
                                                    {(gym.gymName || '?').charAt(0)}
                                                </div>
                                                <div className="ml-4 text-left">
                                                    <div className="text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-indigo-600">{gym.gymName}</div>
                                                    <div className="text-sm text-gray-500">{gym.branchName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Contact Info">
                                            <div className="text-left">
                                                <div className="text-sm text-gray-900 font-medium">{gym.owner}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {gym.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Location">
                                            <div className="flex items-center text-sm text-gray-500 max-w-xs justify-end md:justify-start">
                                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:scale-125" />
                                                <span className="truncate">{gym.location}</span>
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`saas-badge transition-all duration-300 group-hover:scale-105 ${gym.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                                                <span className={`badge-dot ${gym.status === 'Active' ? 'animate-pulse bg-green-600' : 'bg-red-600'}`}></span>
                                                {gym.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(gym)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(gym.id)}
                                                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 hover:rotate-12 group/btn ${gym.status === 'Active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={gym.status === 'Active' ? 'Suspend' : 'Activate'}
                                                >
                                                    <Ban className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-180" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(gym.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        <div className="flex flex-col items-center">
                                            <Search className="h-10 w-10 text-gray-200 mb-4" />
                                            <p>No gyms found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                {gyms.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="text-gray-900">{Math.min(page * 10, totalGyms)}</span> of <span className="text-gray-900">{totalGyms}</span> gyms
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 hover:scale-110 ${page === i + 1
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Gym Details Drawer */}
            <RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                title="Gym Details"
                subtitle={selectedGym?.gymName}
                maxWidth="max-w-md"
            >
                {selectedGym && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="flex flex-col items-center mb-8">
                                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl mb-4 shadow-lg shadow-indigo-100">
                                    {(selectedGym.gymName || '?').charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 text-center">
                                    {selectedGym.gymName}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">{selectedGym.branchName}</p>
                                <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${selectedGym.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedGym.status}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Owner Details</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                                            {(selectedGym.owner || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{selectedGym.owner}</p>
                                            <div className="flex items-center text-xs font-medium text-gray-500 mt-0.5">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {selectedGym.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Location</label>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 pt-2 leading-relaxed">
                                            {selectedGym.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t border-gray-100 pt-6">
                            <button
                                onClick={() => setIsViewDrawerOpen(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Add Gym Drawer */}
            <AddGymDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                onSuccess={loadGyms}
            />
        </div>
    );
};

export default AllGyms;
