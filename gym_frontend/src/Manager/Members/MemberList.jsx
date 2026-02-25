import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, FileText, ChevronDown, Check, User, X, UserCheck } from 'lucide-react';
import { getMembers, toggleMemberStatus, deleteMember, createMember, updateMember } from '../../api/manager/managerApi';
import { membershipApi } from '../../api/membershipApi';
import { exportCSV, exportPDF } from '../../api/manager/managerExport';
import '../../styles/GlobalDesign.css'; // Importing global design system
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import TrainerChangeRequestDrawer from '../../components/drawers/TrainerChangeRequestDrawer';
import MobileCard from '../../components/common/MobileCard';



const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all">Cancel</button>
                    <button onClick={onConfirm} className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all">Confirm Delete</button>
                </div>
            </div>
        </div>
    );
};

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isTrainerDrawerOpen, setIsTrainerDrawerOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [selectedMember, setSelectedMember] = useState(null);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        phone: '',
        planId: '',
        status: 'Active'
    });
    const [editMemberData, setEditMemberData] = useState({
        name: '',
        phone: '',
        planId: '',
        status: ''
    });

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('add') === 'true') {
            setIsAddDrawerOpen(true);
        }
    }, [location.search]);

    useEffect(() => {
        loadPlans();
    }, []);

    useEffect(() => {
        loadMembers();
    }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

    const loadPlans = async () => {
        setPlansLoading(true);
        try {
            const result = await membershipApi.getPlans();
            // result should be an array of plans
            setPlans(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error loading plans:", error);
            setPlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    const loadMembers = async () => {
        setLoading(true);
        try {
            const filters = {
                search: searchTerm,
                status: statusFilter === 'All' ? '' : statusFilter
            };
            const result = await getMembers({ filters, page: currentPage, limit: itemsPerPage });
            setMembers(result?.data || []);
            setTotalItems(result?.total || 0);
        } catch (error) {
            console.error("Error loading members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (id) => {
        await toggleMemberStatus(id);
        loadMembers();
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (deleteModal.id) {
            await deleteMember(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
            loadMembers();
        }
    };

    const handleExportCSV = () => {
        exportCSV(members, 'MemberList');
    };

    const handleExportPDF = () => {
        exportPDF(members, 'MemberList');
    };

    const handleView = (member) => {
        setSelectedMember(member);
        setIsViewDrawerOpen(true);
    };

    const handleEdit = (member) => {
        setSelectedMember(member);
        setEditMemberData({
            name: member.name,
            phone: member.phone,
            planId: member.planId,
            status: member.status
        });
        setIsEditDrawerOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await updateMember(selectedMember.id, editMemberData);
        setIsEditDrawerOpen(false);
        loadMembers();
    };

    const handleTrainerChangeSubmit = (requestData) => {
        console.log("Member List received Trainer Change Request:", requestData);
        // Optionally show a toast here if a global toast system exists
        setIsTrainerDrawerOpen(false);
    };

    const handleAddMemberSubmit = async (e) => {
        e.preventDefault();
        const memberId = `MEM-2024-${Math.floor(100 + Math.random() * 900)}`;
        const joinDate = new Date().toISOString().split('T')[0];
        // Note: expiryDate is usually handled by backend based on plan duration

        await createMember({
            ...newMemberData,
            memberId,
            joinDate
        });

        setIsAddDrawerOpen(false);
        setNewMemberData({ name: '', phone: '', planId: '', status: 'Active' });
        loadMembers();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 shadow-sm hover:scale-110 hover:shadow-lg hover:bg-green-100 transition-all duration-300 cursor-pointer">Active</span>;
            case 'Inactive':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 hover:scale-110 hover:shadow-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer">Inactive</span>;
            case 'Expired':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm hover:scale-110 hover:shadow-lg hover:bg-red-100 transition-all duration-300 cursor-pointer">Expired</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">Unknown</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <User size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Member List
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Manage and view all registered members</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md group"
                            >
                                <Download size={16} className="text-slate-500 group-hover:text-violet-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300" />
                                <span className="hidden sm:inline">Export CSV</span><span className="sm:hidden">CSV</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md group"
                            >
                                <FileText size={16} className="text-slate-500 group-hover:text-violet-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300" />
                                <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">PDF</span>
                            </button>
                            <button
                                onClick={() => setIsAddDrawerOpen(true)}
                                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative sm:hidden">+ Add</span>
                                <span className="relative hidden sm:inline">+ Add New Member</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-visible hover:shadow-2xl hover:border-violet-200 transition-all duration-300">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between overflow-visible hover:bg-violet-50/20 transition-colors duration-300">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-violet-500 group-hover:scale-110 duration-300" size={18} />
                        <input
                            type="text"
                            className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm bg-white hover:border-slate-300 shadow-sm focus:shadow-lg"
                            placeholder="Search by name, ID, or phone..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="w-full md:w-48 relative z-20 hover:scale-105 transition-transform duration-300">
                        <CustomDropdown
                            options={['All', 'Active', 'Inactive', 'Expired']}
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            placeholder="All Status"
                            icon={Filter}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile View Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4 mt-6">
                {loading ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <div className="flex flex-col items-center gap-3 text-violet-600">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-black uppercase tracking-widest">Loading...</span>
                        </div>
                    </div>
                ) : members.length > 0 ? (
                    members.map((member) => (
                        <MobileCard
                            key={member.id}
                            title={member.name}
                            subtitle={member.memberId}
                            badge={member.status}
                            badgeColor={member.status === 'Active' ? 'emerald' : member.status === 'Expired' ? 'rose' : 'slate'}
                            fields={[
                                { label: 'Phone', value: member.phone },
                                { label: 'Plan', value: member.plan },
                                { label: 'Expiry', value: member.expiryDate }
                            ]}
                            actions={[
                                { label: 'View', icon: Eye, variant: 'primary', onClick: () => handleView(member) },
                                { label: 'Edit', icon: Edit, variant: 'secondary', onClick: () => handleEdit(member) }
                            ]}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <p className="text-slate-500 font-bold">No members found</p>
                    </div>
                )}
            </div>

            {/* Desktop Filters & Table Section */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-visible hover:shadow-2xl hover:border-violet-200 transition-all duration-300 mt-8">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between overflow-visible hover:bg-violet-50/20 transition-colors duration-300">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Member Name</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Member ID</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Phone Number</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Plan</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Join Date</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Expiry Date</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider text-right hover:text-purple-700 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-violet-600">
                                            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading members...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.002] transform">
                                        <td className="px-4 sm:px-6 py-4" data-label="Member Name">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 flex items-center justify-center font-bold text-sm mr-3 group-hover:scale-125 group-hover:shadow-lg group-hover:rotate-6 transition-all duration-500 border-2 border-violet-200">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-violet-700 group-hover:translate-x-1 transition-all duration-300">{member.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Member ID">
                                            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-violet-100 group-hover:text-violet-700 group-hover:scale-110 transition-all duration-300 inline-block">{member.memberId}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Phone Number">
                                            <span className="text-sm text-gray-600 group-hover:text-violet-600 transition-colors duration-300">{member.phone}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Plan">
                                            <span className="text-sm text-gray-900 font-semibold group-hover:text-violet-700 group-hover:scale-105 inline-block transition-all duration-300">{member.plan}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Join Date">
                                            <span className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors duration-300">{member.joinDate}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Expiry Date">
                                            <span className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors duration-300">{member.expiryDate}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4" data-label="Status">
                                            <button
                                                onClick={() => handleToggleStatus(member.id)}
                                                className="hover:scale-110 active:scale-95 transition-transform duration-300"
                                            >
                                                {getStatusBadge(member.status)}
                                            </button>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 transform sm:translate-x-2 sm:group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleView(member)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all hover:scale-110 hover:rotate-6 duration-300"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 hover:-rotate-6 duration-300"
                                                    title="Edit Member"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 duration-300"
                                                    title="Delete Member"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                                                <Search size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Members Found</h3>
                                                <p className="text-slate-500 text-sm font-medium mt-1">We couldn't find any results for your current query.</p>
                                            </div>
                                            <button
                                                onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                                                className="mt-4 px-8 py-3 bg-violet-50 text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, id: null })}
                    onConfirm={confirmDelete}
                    title="Remove Member?"
                    message="This will permanently delete the member record from the system. This action cannot be undone."
                />

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-violet-50/20 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs font-medium text-gray-500 text-center sm:text-left whitespace-nowrap">
                                Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-gray-900">{totalItems}</span> members
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Per page:</span>
                                <div className="w-20">
                                    <CustomDropdown
                                        options={[5, 10, 20]}
                                        value={itemsPerPage}
                                        onChange={(val) => {
                                            setItemsPerPage(parseInt(val));
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:scale-110 hover:border-violet-300 disabled:hover:scale-100 group"
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all hover:scale-110 ${currentPage === page
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200'
                                            : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600 hover:shadow-sm'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:scale-110 hover:border-violet-300 disabled:hover:scale-100 group"
                            >
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add New Member Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Member"
                subtitle="Register a new member to the branch"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => setIsAddDrawerOpen(false)}
                            className="flex-1 h-11 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="add-member-form"
                            className="flex-1 h-11 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Register Member
                        </button>
                    </div>
                }
            >
                <form id="add-member-form" onSubmit={handleAddMemberSubmit} className="flex flex-col gap-8 px-6 py-4 mt-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                            required
                            type="text"
                            className="saas-input w-full h-11 px-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50 focus:bg-white transition-all"
                            placeholder="Enter member name"
                            value={newMemberData.name}
                            onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                            required
                            type="tel"
                            className="saas-input w-full h-11 px-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50 focus:bg-white transition-all"
                            placeholder="+91 00000 00000"
                            value={newMemberData.phone}
                            onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Membership Plan</label>
                            <CustomDropdown
                                options={plans.map(p => ({ value: p.id, label: p.name }))}
                                value={newMemberData.planId}
                                onChange={(val) => setNewMemberData({ ...newMemberData, planId: val })}
                                placeholder={plansLoading ? "Loading plans..." : "Select a plan"}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Initial Status</label>
                            <CustomDropdown
                                options={['Active', 'Inactive']}
                                value={newMemberData.status}
                                onChange={(val) => setNewMemberData({ ...newMemberData, status: val })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </form>
            </RightDrawer>

            {/* View Member Drawer */}
            <RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                title="Member Details"
                subtitle={selectedMember?.name}
                maxWidth="max-w-md"
                footer={
                    <button
                        onClick={() => setIsViewDrawerOpen(false)}
                        className="w-full h-11 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                    >
                        Close
                    </button>
                }
            >
                {selectedMember && (
                    <div className="space-y-6 px-6 py-6 mt-2">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-black shadow-inner">
                                {(selectedMember?.name || '?').charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedMember.name}</h3>
                                <p className="text-sm font-mono text-indigo-600 font-medium">{selectedMember.memberId}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedMember.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedMember.plan}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Join Date</p>
                                <p className="text-sm text-gray-600 font-medium">{selectedMember.joinDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry Date</p>
                                <p className="text-sm text-gray-600 font-medium">{selectedMember.expiryDate}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription Status</span>
                                {getStatusBadge(selectedMember.status)}
                            </div>
                            <button
                                onClick={() => setIsTrainerDrawerOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-50 text-violet-600 rounded-xl font-bold hover:bg-violet-600 hover:text-white transition-all duration-300 border border-violet-100 group shadow-sm hover:shadow-violet-200"
                            >
                                <UserCheck size={18} className="group-hover:scale-110 transition-transform" />
                                Request Trainer Change
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Trainer Change Request Drawer */}
            <TrainerChangeRequestDrawer
                isOpen={isTrainerDrawerOpen}
                onClose={() => setIsTrainerDrawerOpen(false)}
                member={selectedMember}
                onSubmit={handleTrainerChangeSubmit}
            />

            {/* Edit Member Drawer */}
            <RightDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                title="Edit Member"
                subtitle={`Updating info for ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(false)}
                            className="flex-1 h-11 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-member-form"
                            className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                    </div>
                }
            >
                <form id="edit-member-form" onSubmit={handleEditSubmit} className="flex flex-col gap-8 px-6 py-4 mt-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                            required
                            type="text"
                            className="saas-input w-full h-11 px-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50 focus:bg-white transition-all"
                            placeholder="Enter member name"
                            value={editMemberData.name}
                            onChange={(e) => setEditMemberData({ ...editMemberData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                            required
                            type="tel"
                            className="saas-input w-full h-11 px-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50 focus:bg-white transition-all"
                            placeholder="+91 00000 00000"
                            value={editMemberData.phone}
                            onChange={(e) => setEditMemberData({ ...editMemberData, phone: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Plan</label>
                            <CustomDropdown
                                options={plans.map(p => ({ value: p.id, label: p.name }))}
                                value={editMemberData.planId}
                                onChange={(val) => setEditMemberData({ ...editMemberData, planId: val })}
                                placeholder={plansLoading ? "Loading plans..." : "Select a plan"}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                            <CustomDropdown
                                options={['Active', 'Inactive', 'Expired']}
                                value={editMemberData.status}
                                onChange={(val) => setEditMemberData({ ...editMemberData, status: val })}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditDrawerOpen(false);
                                setTimeout(() => setIsTrainerDrawerOpen(true), 300);
                            }}
                            className="flex items-center gap-2 text-violet-600 font-bold text-xs hover:text-violet-700 transition-colors"
                        >
                            <UserCheck size={14} />
                            Requested Trainer Change for this member?
                        </button>
                    </div>
                </form>
            </RightDrawer>
        </div >
    );
};

export default MemberList;
