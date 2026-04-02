import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Pencil, Ban, Trash2, MapPin, Phone, Eye } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import AddGymDrawer from './AddGymDrawer';
import { fetchAllGyms, deleteGym, toggleGymStatus, exportTable } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AllGyms = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState(null);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteGym(confirmModal.id);
            toast.success('Gym deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadGyms();
        } catch (error) {
            toast.error('Failed to delete gym');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleGymStatus(id);
            loadGyms();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleExport = () => {
        exportTable('Gyms');
    };

    const handleView = (gym) => {
        setSelectedGym(gym);
        setIsViewDrawerOpen(true);
    };

    const handleEdit = (gym) => {
        setSelectedGym(gym);
        setIsAddDrawerOpen(true);
    };

    const handleAdd = () => {
        setSelectedGym(null);
        setIsAddDrawerOpen(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading && gyms.length === 0) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading Gym Data...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gym Management</h1>
                    <p className="page-subtitle">Manage all gym branches and their statuses ({totalGyms} total)</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={handleAdd}
                        className="btn btn-primary"
                    >
                        <Plus size={16} />
                        Add New Gym
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="saas-input"
                        placeholder="Search gyms, branches..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {['All', 'Active', 'Suspended'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilterStatus(status);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-btn text-sm font-semibold transition-all whitespace-nowrap ${filterStatus === status
                                ? 'bg-primary-light text-primary border border-primary/20'
                                : 'text-muted-foreground hover:bg-muted border border-transparent'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="saas-card !p-0 overflow-hidden">
                <div className="saas-table-wrapper relative">
                    {loading && (
                        <div className="table-overlay-loader">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Gym Detail</th>
                                <th>Contact Info</th>
                                <th>Location</th>
                                <th>SaaS Plan</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.length > 0 ? (
                                gyms.map((gym) => (
                                    <tr key={gym.id} className="group cursor-pointer">
                                        <td data-label="Gym Detail">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-card bg-primary-light flex items-center justify-center text-primary font-bold text-lg">
                                                    {(gym.gymName || '?').charAt(0)}
                                                </div>
                                                <div className="ml-4 text-left">
                                                    <div className="text-sm font-semibold text-title">{gym.gymName}</div>
                                                    <div className="text-sm text-muted-foreground">{gym.branchName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Contact Info">
                                            <div className="text-left">
                                                <div className="text-sm text-title font-medium">{gym.owner}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {gym.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Location">
                                            <div className="flex items-center text-sm text-muted-foreground max-w-xs">
                                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                <span className="truncate">{gym.location}</span>
                                            </div>
                                        </td>
                                        <td data-label="SaaS Plan">
                                            <span className="status-badge status-badge-purple">
                                                {gym.planName || 'No Plan'}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${gym.status === 'Active' ? 'status-badge-green' : 'status-badge-red'}`}>
                                                <span className="badge-dot"></span>
                                                {gym.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleView(gym)} className="action-icon-btn" title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleEdit(gym)} className="action-icon-btn" title="Edit Gym">
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(gym.id)}
                                                    className={`action-icon-btn ${gym.status === 'Active' ? 'warning' : 'success'}`}
                                                    title={gym.status === 'Active' ? 'Suspend' : 'Activate'}
                                                >
                                                    <Ban size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(gym.id)} className="action-icon-btn danger" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Search className="h-10 w-10 text-border mb-4" />
                                            <p className="text-muted-foreground font-medium">No gyms found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {gyms.length > 0 && (
                    <div className="pagination-wrapper">
                        <div className="pagination-info">
                            Showing <span>{(page - 1) * 10 + 1}</span> to <span>{Math.min(page * 10, totalGyms)}</span> of <span>{totalGyms}</span> gyms
                        </div>
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`pagination-num ${page === i + 1 ? 'active' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="pagination-btn"
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
                        <div className="flex-1 pr-2">
                            <div className="flex flex-col items-center mb-8">
                                <div className="h-20 w-20 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-3xl mb-4 shadow-md">
                                    {(selectedGym.gymName || '?').charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-title text-center">
                                    {selectedGym.gymName}
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1">{selectedGym.branchName}</p>
                                <span className={`mt-3 status-badge ${selectedGym.status === 'Active' ? 'status-badge-green' : 'status-badge-red'}`}>
                                    <span className="badge-dot"></span>
                                    {selectedGym.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-card border border-border">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Owner Details</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-muted-foreground font-bold border border-border">
                                            {(selectedGym.owner || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-title">{selectedGym.owner}</p>
                                            <div className="flex items-center text-xs font-medium text-muted-foreground mt-0.5">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {selectedGym.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted p-4 rounded-card border border-border">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">SaaS Subscription</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold border border-primary/20">
                                            P
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-title">{selectedGym.planName || 'No Active Plan'}</p>
                                            <p className="text-xs font-semibold uppercase text-primary tracking-wider mt-0.5">Active Membership</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted p-4 rounded-card border border-border">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Location</label>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-body pt-2 leading-relaxed">
                                            {selectedGym.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t border-border pt-6">
                            <button
                                onClick={() => setIsViewDrawerOpen(false)}
                                className="btn btn-primary w-full justify-center py-3"
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
                onClose={() => {
                    setIsAddDrawerOpen(false);
                    setSelectedGym(null);
                }}
                onSuccess={loadGyms}
                editData={selectedGym}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Gym?"
                message="This will permanently remove the gym and all its data. This action cannot be undone."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default AllGyms;
