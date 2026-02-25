import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, User, Building, Edit2, Mail, Phone, Trash2 } from 'lucide-react';
import MobileCard from '../components/common/MobileCard';
import RightDrawer from '../components/common/RightDrawer';
import { fetchTrainerRequests, updateTrainerRequest, addStaff, editStaff, deleteStaffMember } from '../api/superadmin/superAdminApi';
import { createStaffAPI, fetchTrainerRequestsAPI, updateTrainerRequestAPI, updateStaffAPI, deleteStaffAPI } from '../api/admin/adminApi';

const TrainerRequests = ({ role }) => {
    // State
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTrainerId, setSelectedTrainerId] = useState(null);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

    // Form State
    const [newTrainer, setNewTrainer] = useState({
        name: '',
        email: '',
        phone: '',
        branch: '',
        role: '',
        baseSalary: '',
        commission: '',
        status: 'Pending',
        documents: null
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    // Fetch Data

    const loadTrainers = async () => {
        try {
            setLoading(true);
            const data = role === 'SUPER_ADMIN' ? await fetchTrainerRequests() : await fetchTrainerRequestsAPI();
            setTrainers(data);
        } catch (error) {

            console.error("Failed to load trainer requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrainers();
    }, []);

    // Derived State for Drawer
    const selectedTrainer = trainers.find(t => t.id === selectedTrainerId);

    // Action Handlers
    const handleApprove = async (id) => {
        try {
            if (role === 'SUPER_ADMIN') {
                await updateTrainerRequest(id, 'Approved');
            } else {
                await updateTrainerRequestAPI(id, 'Approved');
            }
            loadTrainers();
        } catch (error) {
            console.error("Failed to approve trainer:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            if (role === 'SUPER_ADMIN') {
                await updateTrainerRequest(id, 'Rejected');
            } else {
                await updateTrainerRequestAPI(id, 'Rejected');
            }
            loadTrainers();
        } catch (error) {

            console.error("Failed to reject trainer:", error);
        }
    };

    const handleSaveTrainer = async (e) => {
        e.preventDefault();
        // Validation
        if (!newTrainer.name || !newTrainer.email || !newTrainer.phone || !newTrainer.branch) {
            return;
        }

        try {
            const payload = {
                ...newTrainer,
                role: 'TRAINER', // Force the backend role type to TRAINER
                trainerConfig: {
                    specialization: newTrainer.role, // Mapping frontend specialization back to backend config
                    commissionType: 'percentage',
                    commissionValue: newTrainer.commission
                }
            };

            if (selectedTrainerId) {
                // Edit Mode
                if (role === 'SUPER_ADMIN') {
                    await editStaff(selectedTrainerId, payload);
                } else {
                    await updateStaffAPI(selectedTrainerId, payload);
                }
                loadTrainers();
            } else {
                // Add Mode
                if (role === 'SUPER_ADMIN') {
                    await addStaff(payload);
                } else {
                    await createStaffAPI(payload);
                }
                loadTrainers();
            }
            closeAddDrawer();

        } catch (error) {
            console.error("Failed to save trainer:", error);
            alert("Failed to save trainer: " + (error.response?.data?.message || error.message));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "gym_preset"); // Use unsigned preset 'gym_preset' from Cloudinary
            formData.append("cloud_name", "dw48hcxi5");

            const response = await fetch("https://api.cloudinary.com/v1_1/dw48hcxi5/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                setNewTrainer(prev => ({ ...prev, documents: data.secure_url }));
            } else {
                alert("Upload failed: " + data.error?.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this trainer application?")) return;
        try {
            if (role === 'SUPER_ADMIN') {
                await deleteStaffMember(id);
            } else {
                await deleteStaffAPI(id);
            }
            loadTrainers();
        } catch (error) {
            console.error("Failed to delete trainer:", error);
            alert("Failed to delete: " + (error.response?.data?.message || error.message));
        }
    };

    const openDrawer = (trainer) => {

        setSelectedTrainerId(trainer.id);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedTrainerId(null), 300);
    };

    const openAddDrawer = (trainer = null) => {
        if (trainer) {
            setSelectedTrainerId(trainer.id);
            setNewTrainer({
                name: trainer.name,
                email: trainer.email,
                phone: trainer.phone,
                branch: trainer.branch,
                role: trainer.role || '',
                baseSalary: trainer.baseSalary || '',
                commission: trainer.commission || '',
                status: trainer.status
            });
        } else {
            setSelectedTrainerId(null);
            setNewTrainer({ name: '', email: '', phone: '', branch: '', role: '', baseSalary: '', commission: '', status: 'Pending' });
        }
        setIsAddDrawerOpen(true);
    };

    const closeAddDrawer = () => {
        setIsAddDrawerOpen(false);
        setTimeout(() => {
            setSelectedTrainerId(null);
            setNewTrainer({ name: '', email: '', phone: '', branch: '', role: '', baseSalary: '', commission: '', status: 'Pending' });
        }, 300);
    };


    // Dynamically acquire current user branch for proper UI filtering
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentUserBranch = currentUser.tenantName || currentUser.branchName || 'Downtown Center';

    // Filter Logic
    const filteredRequests = trainers.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

        // RBAC: Managers only see their branch. Super Admin and Branch Admin see all.
        const isAdmin = role === 'SUPER_ADMIN' || role === 'BRANCH_ADMIN';
        const matchesBranch = isAdmin || req.branch === currentUserBranch;

        return matchesSearch && matchesStatus && matchesBranch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20';
            case 'Rejected':
                return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20';
            default:
                return 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20';
        }
    };

    return (
        <div className="p-6 w-full animate-slide-up relative overflow-hidden">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trainer Requests</h1>
                <p className="text-sm text-gray-500 mt-1">Review and manage new trainer applications across all branches</p>
            </div>

            {/* Top Actions Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by trainer name..."
                            className="saas-input pl-10 transition-all duration-300 focus:scale-[1.01] focus:shadow-md h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full sm:w-48 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500" />
                        </div>
                        <select
                            className="saas-input pl-10 bg-white cursor-pointer h-11"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={openAddDrawer}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 active:scale-95 h-11"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Trainer</span>
                </button>
            </div>

            {/* Main Table Section (Desktop) */}
            <div className="hidden md:block saas-card p-0 overflow-hidden shadow-soft rounded-xl mb-6">
                <div className="saas-table-wrapper overflow-x-auto">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested Branch</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                        <td className="px-6 py-4 whitespace-nowrap" data-label="Trainer Name">
                                            <div className="text-sm font-semibold text-gray-900">{req.name}</div>
                                            <div className="text-xs text-gray-400">ID: TRN-{req.id.toString().padStart(3, '0')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" data-label="Contact Info">
                                            <div className="text-sm text-gray-600">{req.email}</div>
                                            <div className="text-xs text-gray-400">{req.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" data-label="Requested Branch">
                                            <div className="text-sm text-gray-600">{req.branch}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" data-label="Status">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center" data-label="Action">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={req.status !== 'Pending'}
                                                    title={req.status === 'Pending' ? 'Approve' : `Already ${req.status}`}
                                                    className={`p-1.5 text-green-600 bg-green-50 rounded-lg transition-colors ${req.status !== 'Pending' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-green-100'}`}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.id)}
                                                    disabled={req.status !== 'Pending'}
                                                    title={req.status === 'Pending' ? 'Reject' : `Already ${req.status}`}
                                                    className={`p-1.5 text-red-600 bg-red-50 rounded-lg transition-colors ${req.status !== 'Pending' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-100'}`}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDrawer(req)}
                                                    title="View Details"
                                                    className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openAddDrawer(req)}
                                                    title="Edit Trainer"
                                                    className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    title="Delete"
                                                    className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-50 rounded-full">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No results found matching "{searchQuery}"</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View (md:hidden) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <MobileCard
                            key={req.id}
                            title={req.name}
                            subtitle={`ID: TRN-${req.id.toString().padStart(3, '0')}`}
                            badge={{
                                label: req.status,
                                color: req.status === 'Approved' ? 'emerald' : req.status === 'Rejected' ? 'red' : 'amber'
                            }}
                            fields={[
                                { label: 'Branch', value: req.branch, icon: Building },
                                { label: 'Email', value: req.email, icon: Mail },
                                { label: 'Phone', value: req.phone, icon: Phone },
                            ]}
                            actions={[
                                {
                                    label: 'View Details',
                                    icon: Eye,
                                    variant: 'secondary',
                                    onClick: () => openDrawer(req)
                                },
                                {
                                    label: 'Edit',
                                    icon: Edit2,
                                    variant: 'secondary',
                                    onClick: () => openAddDrawer(req)
                                },
                                {
                                    label: 'Delete',
                                    icon: Trash2,
                                    variant: 'danger',
                                    onClick: () => handleDelete(req.id)
                                },
                                ...(req.status === 'Pending' ? [
                                    {
                                        label: 'Approve',
                                        icon: CheckCircle,
                                        variant: 'primary',
                                        onClick: () => handleApprove(req.id)
                                    },
                                    {
                                        label: 'Reject',
                                        icon: XCircle,
                                        variant: 'danger',
                                        onClick: () => handleReject(req.id)
                                    }
                                ] : [])
                            ]}
                        />
                    ))
                ) : (
                    <div className="bg-white p-10 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
                        No results found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Pagination Placeholder UI */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredRequests.length}</span> of{' '}
                            <span className="font-semibold">{filteredRequests.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs">
                            <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 opacity-50 cursor-not-allowed">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">1</button>
                            <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 opacity-50 cursor-not-allowed">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Right Side View Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Trainer Profile"
                subtitle={selectedTrainer ? `ID: TRN-${selectedTrainer.id.toString().padStart(3, '0')}` : ''}
            >
                {selectedTrainer && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{selectedTrainer.name}</h3>
                            <div className="mt-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusStyles(selectedTrainer.status)}`}>
                                    {selectedTrainer.status}
                                </span>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="grid grid-cols-1 gap-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contract Status</p>
                                    <p className="text-gray-900 font-medium">New Application</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact Email</p>
                                    <p className="text-gray-900 font-medium">{selectedTrainer.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-gray-900 font-medium">{selectedTrainer.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                    <Building className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Requested Branch</p>
                                    <p className="text-gray-900 font-medium">{selectedTrainer.branch}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 space-y-3">
                            <button
                                onClick={() => handleApprove(selectedTrainer.id)}
                                disabled={selectedTrainer.status !== 'Pending'}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${selectedTrainer.status === 'Pending' ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-100 hover:scale-[1.02] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                            >
                                <CheckCircle className="w-5 h-5" />
                                <span>Approve Request</span>
                            </button>
                            <button
                                onClick={() => handleReject(selectedTrainer.id)}
                                disabled={selectedTrainer.status !== 'Pending'}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${selectedTrainer.status === 'Pending' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-red-50 hover:scale-[1.02] active:scale-95' : 'bg-gray-50 text-gray-300 cursor-not-allowed border-none shadow-none'}`}
                            >
                                <XCircle className="w-5 h-5" />
                                <span>Reject Request</span>
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
            {/* Add Trainer Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={closeAddDrawer}
                title={selectedTrainerId ? 'Edit Trainer' : 'Add New Trainer'}
            >
                <form onSubmit={handleSaveTrainer} className="flex flex-col gap-6 p-6 pt-4">
                    <div>
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-1">
                            {selectedTrainerId ? 'Edit Configuration' : 'New Registration'}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">Please provide accurate trainer information</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trainer Name *</label>
                            <input
                                required
                                type="text"
                                className="saas-input w-full"
                                placeholder="Enter full name"
                                value={newTrainer.name || ''}
                                onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization / Role *</label>
                            <input
                                required
                                type="text"
                                className="saas-input w-full"
                                placeholder="e.g. Senior PT, Yoga Expert"
                                value={newTrainer.role || ''}
                                onChange={(e) => setNewTrainer({ ...newTrainer, role: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                            <input
                                required
                                type="email"
                                className="saas-input w-full"
                                placeholder="example@gym.com"
                                value={newTrainer.email || ''}
                                onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                            <input
                                required
                                type="tel"
                                className="saas-input w-full"
                                placeholder="+1 234-567-8900"
                                value={newTrainer.phone || ''}
                                onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Salary *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="saas-input w-full pl-8"
                                    placeholder="25000"
                                    value={newTrainer.baseSalary || ''}
                                    onChange={(e) => setNewTrainer({ ...newTrainer, baseSalary: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Commission % (PT Sharing) *</label>
                            <div className="relative">
                                <span className="absolute right-10 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                                <input
                                    required
                                    type="number"
                                    className="saas-input w-full pr-12"
                                    placeholder="20"
                                    value={newTrainer.commission || ''}
                                    onChange={(e) => setNewTrainer({ ...newTrainer, commission: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Requested Branch *</label>
                        <select
                            required
                            className="saas-input w-full bg-white cursor-pointer"
                            value={newTrainer.branch || ''}
                            onChange={(e) => setNewTrainer({ ...newTrainer, branch: e.target.value })}
                        >
                            <option value="">Select Branch</option>
                            <option value="Downtown Center">Downtown Center</option>
                            <option value="Westside Gym">Westside Gym</option>
                            <option value="Eastside Fitness">Eastside Fitness</option>
                            <option value="North Point">North Point</option>
                            <option value="South Bay">South Bay</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload Government ID / Documents *</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Plus className="w-8 h-8 mb-3 text-gray-400" />
                                    {uploadingImage ? (
                                        <p className="mb-2 text-sm text-gray-500 font-semibold">Uploading...</p>
                                    ) : newTrainer.documents ? (
                                        <p className="mb-2 text-sm text-green-600 font-semibold">Document Uploaded Successfully</p>
                                    ) : (
                                        <>
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-400">PDF, PNG, JPG (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={uploadingImage} />

                            </label>
                        </div>
                    </div>

                    {selectedTrainerId && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Status *</label>
                            <select
                                required
                                className="saas-input w-full bg-white cursor-pointer"
                                value={newTrainer.status}
                                onChange={(e) => setNewTrainer({ ...newTrainer, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-8 space-y-3">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
                        >
                            {selectedTrainerId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            <span>{selectedTrainerId ? 'Save Changes' : 'Add Trainer'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={closeAddDrawer}
                            className="w-full py-4 bg-gray-50 text-gray-600 rounded-xl font-bold transition-all duration-300 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default TrainerRequests;
