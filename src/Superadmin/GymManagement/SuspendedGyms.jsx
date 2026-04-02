import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Ban, AlertCircle, Phone } from 'lucide-react';
import { fetchAllGyms, toggleGymStatus } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const SuspendedGyms = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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

    const handleReactivate = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processReactivate = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await toggleGymStatus(confirmModal.id);
            toast.success('Gym reactivated successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadSuspendedGyms();
        } catch (error) {
            toast.error('Failed to reactivate gym');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    if (loading && gyms.length === 0) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Suspended Gyms</h1>
                    <p className="page-subtitle">Review and manage suspended gym accounts.</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-amber-700 font-medium">
                            Suspended gyms cannot access the platform. Reactivating them will grant immediate access to their dashboards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="saas-input"
                        placeholder="Search suspended gyms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                <th>Owner</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.length > 0 ? (
                                gyms.map((gym) => (
                                    <tr key={gym.id} className="group cursor-pointer transition-all duration-200">
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
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Phone size={12} />
                                                {gym.phone}
                                            </div>
                                        </td>
                                        <td data-label="Owner">
                                            <span className="text-sm text-title font-semibold">{gym.owner}</span>
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge status-badge-red">
                                                <span className="badge-dot"></span>
                                                Suspended
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleReactivate(gym.id)}
                                                    className="btn btn-success"
                                                >
                                                    <RotateCcw size={14} />
                                                    Reactivate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Ban className="h-10 w-10 text-border mb-4" />
                                            <p className="text-muted-foreground font-medium">No suspended gyms found.</p>
                                            <p className="text-sm text-muted-foreground mt-1">All gym accounts are currently active.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processReactivate}
                title="Reactivate Gym?"
                message="This gym will regain full access to the platform immediately."
                confirmText="Reactivate"
                type="success"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default SuspendedGyms;
