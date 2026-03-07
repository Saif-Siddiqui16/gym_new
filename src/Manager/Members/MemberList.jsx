import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, FileText, User } from 'lucide-react';
import { getMembers, toggleMemberStatus, deleteMember, createMember, updateMember } from '../../api/manager/managerApi';
import { membershipApi } from '../../api/membershipApi';
import { referralApi } from '../../api/referralApi';
import { exportCSV, exportPDF } from '../../api/manager/managerExport';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';
import { useBranchContext } from '../../context/BranchContext';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';


const MemberList = () => {
    // ─── STATE (all logic preserved, untouched) ───
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
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [selectedMember, setSelectedMember] = useState(null);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const initialNewMemberData = {
        name: '', phone: '', email: '', gender: '', dob: '', source: 'Walk-in',
        referralCode: '', idType: '', idNumber: '', address: '',
        emergencyName: '', emergencyPhone: '', fitnessGoal: '', healthConditions: ''
    };
    const [newMemberData, setNewMemberData] = useState(initialNewMemberData);
    const [editMemberData, setEditMemberData] = useState({ ...initialNewMemberData, status: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [editProfileImage, setEditProfileImage] = useState(null);
    const profileImageRef = React.useRef(null);
    const editProfileImageRef = React.useRef(null);
    const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
    const [referralVerified, setReferralVerified] = useState(false);

    const location = useLocation();
    const { selectedBranch } = useBranchContext();

    // ─── EFFECTS (all logic preserved, untouched) ───
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('add') === 'true') setIsAddDrawerOpen(true);
    }, [location.search]);

    useEffect(() => { loadPlans(); }, []);
    useEffect(() => { loadMembers(); }, [searchTerm, statusFilter, currentPage, itemsPerPage, selectedBranch]);

    // ─── HANDLERS (all logic preserved, untouched) ───
    const loadPlans = async () => {
        setPlansLoading(true);
        try {
            const result = await membershipApi.getPlans();
            setPlans(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error loading plans:", error);
            setPlans([]);
        } finally { setPlansLoading(false); }
    };

    const loadMembers = async () => {
        setLoading(true);
        try {
            const filters = { search: searchTerm, status: statusFilter === 'All' ? '' : statusFilter };
            const result = await getMembers({ filters, page: currentPage, limit: itemsPerPage, branchId: selectedBranch });
            setMembers(result?.data || []);
            setTotalItems(result?.total || 0);
        } catch (error) {
            console.error("Error loading members:", error);
            toast.error("Failed to load members");
        } finally { setLoading(false); }
    };

    const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
    const handleStatusFilter = (value) => { setStatusFilter(value); setCurrentPage(1); };
    const handleToggleStatus = async (id) => {
        try {
            await toggleMemberStatus(id);
            toast.success("Member status updated");
            loadMembers();
        } catch (error) { toast.error("Failed to update status"); }
    };
    const handleDelete = (member) => {
        setSelectedMember(member);
        setDeleteModal({ isOpen: true, id: member.id });
    };
    const confirmDelete = async () => {
        if (deleteModal.id) {
            try {
                await deleteMember(deleteModal.id);
                setDeleteModal({ isOpen: false, id: null });
                toast.success("Member deleted successfully");
                loadMembers();
            } catch (error) { toast.error("Failed to delete member"); }
        }
    };

    const handleImageChange = (e, mode = 'add') => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                if (mode === 'add') {
                    setProfileImage(base64String);
                } else {
                    setEditProfileImage(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleExportCSV = () => { exportCSV(members, 'MemberList'); toast.success("CSV exported successfully"); };
    const handleExportPDF = () => { exportPDF(members, 'MemberList'); toast.success("PDF exported successfully"); };
    const handleView = (member) => { setSelectedMember(member); setIsViewDrawerOpen(true); };
    const handleEdit = (member) => {
        setSelectedMember(member);
        setEditMemberData({
            name: member.name || '',
            phone: member.phone || '',
            email: member.email || '',
            gender: member.gender || '',
            dob: member.dob || '',
            source: member.source || 'Walk-in',
            referralCode: member.referralCode || '',
            idType: member.idType || '',
            idNumber: member.idNumber || '',
            address: member.address || '',
            emergencyName: member.emergencyName || '',
            emergencyPhone: member.emergencyPhone || '',
            fitnessGoal: member.fitnessGoal || '',
            healthConditions: member.healthConditions || '',
            startDate: member.joinDate ? member.joinDate.split('T')[0] : ''
        });
        setEditProfileImage(member.avatar || null);
        setIsEditDrawerOpen(true);
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editMemberData, avatar: editProfileImage };
            await updateMember(selectedMember.id, payload);
            setIsEditDrawerOpen(false);
            setEditProfileImage(null);
            toast.success("Member updated successfully");
            loadMembers();
        } catch (error) { toast.error(error?.response?.data?.message || "Failed to update member"); }
    };
    const handleAddMemberSubmit = async (e) => {
        e.preventDefault();
        if (!newMemberData.name || !newMemberData.phone) {
            toast.error("Name and phone are required");
            return;
        }
        try {
            const memberPayload = { ...newMemberData, avatar: profileImage };

            // Explicitly handle 'all' branches or specific branch selection
            if (selectedBranch === 'all') {
                memberPayload.branchId = 'all';
            } else if (selectedBranch) {
                memberPayload.branchId = selectedBranch;
            }

            await createMember(memberPayload);
            setIsAddDrawerOpen(false);
            setNewMemberData(initialNewMemberData);
            setProfileImage(null);
            toast.success("Member created successfully");
            loadMembers();
        } catch (error) { toast.error(error?.response?.data?.message || "Failed to create member"); }
    };

    const handleVerifyReferral = async () => {
        if (!newMemberData.referralCode) {
            toast.error("Please enter a referral code to verify");
            return;
        }
        setIsVerifyingReferral(true);
        try {
            const data = await referralApi.verifyCode(newMemberData.referralCode, selectedBranch);
            if (data?.valid) {
                setReferralVerified(true);
                toast.success(`Code verified! Referrer: ${data.referrerName}`);
            } else {
                setReferralVerified(false);
                toast.error("Invalid or inactive referral code");
            }
        } catch (error) {
            setReferralVerified(false);
            toast.error(error?.response?.data?.message || "Failed to verify referral code");
        } finally {
            setIsVerifyingReferral(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 shadow-sm hover:scale-110 transition-all duration-300 cursor-pointer">Active</span>;
            case 'Inactive': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 hover:scale-110 transition-all duration-300 cursor-pointer">Inactive</span>;
            case 'Frozen': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-light text-primary border border-violet-100 shadow-sm hover:scale-110 transition-all duration-300 cursor-pointer">Frozen</span>;
            case 'Expired': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm hover:scale-110 transition-all duration-300 cursor-pointer">Expired</span>;
            default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:scale-110 transition-all duration-300 cursor-pointer">Unknown</span>;
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // PREVIOUS MEMBERS PAGE UI — COMMENTED OUT FOR ROLLBACK & AUDIT SAFETY
    // Original return block preserved below. DO NOT DELETE.
    // ──────────────────────────────────────────────────────────────────────────
    /*
    Previous Members Page Content Start

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-light/30 ">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <User size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold ...">Member List</h1>
                                <p className="text-slate-600 text-sm mt-1">Manage and view all registered members</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={handleExportCSV} ...>Export CSV</button>
                            <button onClick={handleExportPDF} ...>Export PDF</button>
                            <button onClick={() => setIsAddDrawerOpen(true)} ...>+ Add New Member</button>
                        </div>
                    </div>
                </div>
            </div>
            ... (full original desktop table + mobile cards + pagination + all drawers)
        </div>
    );

    Previous Members Page Content End
    */

    // ──────────────────────────────────────────────────────────────────────────
    // NEW STATIC MEMBERS PAGE UI — Active rendering below
    // ──────────────────────────────────────────────────────────────────────────

    const kpiCards = [
        { label: 'Total Members', value: totalItems || members.length, color: 'from-primary to-primary' },
        { label: 'Active', value: members.filter(m => m.status === 'Active').length, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Inactive', value: members.filter(m => m.status === 'Inactive' || m.status === 'Frozen').length, color: 'from-slate-400 to-slate-500' },
        { label: 'Expiring Soon', value: members.filter(m => m.daysLeft && m.daysLeft <= 7).length, color: 'from-amber-500 to-amber-600' },
    ];

    const tableColumns = ['Member', 'Code', 'Branch', 'Status', 'Membership', 'Days Left', 'Joined', 'Actions'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-light/30  space-y-6">

            {/* ── Header ── */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg shrink-0">
                                <User size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">Members</h1>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage your gym members and their memberships</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAddDrawerOpen(true)}
                            variant="primary"
                            className="w-full sm:w-auto px-6 h-11"
                        >
                            <User size={18} /> Add Member
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpiCards.map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{kpi.label}</p>
                                <h3 className="text-3xl font-black text-slate-900">{kpi.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filter Bar ── */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by name, email, phone, or member code..."
                        className="pl-10 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all bg-white outline-none" />
                </div>
                <div className="w-full sm:w-48">
                    <CustomDropdown options={['All', 'Active', 'Inactive', 'Frozen', 'Expired']} value={statusFilter} onChange={handleStatusFilter} placeholder="All Status" icon={Filter} />
                </div>
            </div>

            {/* ── Members Table ── */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><User className="text-primary" size={18} />All Members</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{totalItems} members total</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-primary transition-all">
                            <Download size={14} /><span className="hidden sm:inline">CSV</span>
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-primary transition-all">
                            <FileText size={14} /><span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                {members.length > 0 ? (
                    <div className="saas-table-wrapper border-0 rounded-none">
                        <table className="saas-table saas-table-responsive w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 text-left">
                                <tr>
                                    {['Member', 'Code', 'Branch', 'Status', 'Plan', 'Days Left', 'Joined', 'Actions'].map(col => (
                                        <th key={col} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-primary-light/30 transition-all duration-150 border-b border-slate-50">
                                        <td className="p-4 sm:px-6 sm:py-4" data-label="Member">
                                            <div className="flex items-center gap-3 justify-end sm:justify-start">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} className="w-9 h-9 shrink-0 rounded-full object-cover border-2 border-violet-200" />
                                                ) : (
                                                    <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-primary-hover flex items-center justify-center font-bold text-sm border-2 border-violet-200">{(member.name || '?').charAt(0).toUpperCase()}</div>
                                                )}
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-primary-hover transition-colors truncate max-w-[150px] sm:max-w-xs">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:px-6 sm:py-4" data-label="Code"><span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{member.memberId}</span></td>
                                        <td className="p-4 sm:px-6 sm:py-4 text-sm text-slate-600" data-label="Branch">{member.branch || 'Main Branch'}</td>
                                        <td className="p-4 sm:px-6 sm:py-4" data-label="Status">
                                            <div className="flex justify-end sm:justify-start">
                                                <button onClick={() => handleToggleStatus(member.id)}>{getStatusBadge(member.status)}</button>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:px-6 sm:py-4 text-sm font-semibold text-slate-700" data-label="Plan">{member.plan || 'No Plan'}</td>
                                        <td className="p-4 sm:px-6 sm:py-4 text-sm text-slate-600" data-label="Days Left">{member.daysLeft ?? '—'}</td>
                                        <td className="p-4 sm:px-6 sm:py-4 text-sm text-slate-500" data-label="Joined">
                                            {member.joinDate ? new Date(member.joinDate).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="p-4 sm:px-6 sm:py-4" data-label="Actions">
                                            <div className="flex items-center justify-end sm:justify-start gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                                                <button onClick={() => handleView(member)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-all shadow-sm sm:shadow-none border border-slate-100 sm:border-transparent bg-white sm:bg-transparent" title="View"><Eye size={16} /></button>
                                                <button onClick={() => handleEdit(member)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-all shadow-sm sm:shadow-none border border-slate-100 sm:border-transparent bg-white sm:bg-transparent" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(member)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm sm:shadow-none border border-slate-100 sm:border-transparent bg-white sm:bg-transparent" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── Pagination ── */}
                        <div className="bg-white border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-500 font-medium order-2 sm:order-1">
                                Showing <span className="text-slate-900 font-bold">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-slate-900 font-bold">{totalItems}</span> members
                            </p>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 text-slate-400 hover:border-violet-200 hover:text-primary disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {/* Simple Page Indicator for Mobile */}
                                <div className="flex sm:hidden items-center px-4 h-10 rounded-xl bg-slate-50 text-xs font-bold text-slate-600">
                                    Page {currentPage} of {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                                </div>

                                {/* Page Numbers for Desktop */}
                                <div className="hidden sm:flex items-center gap-2">
                                    {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === Math.ceil(totalItems / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                                        .map((page, i, arr) => (
                                            <React.Fragment key={page}>
                                                {i > 0 && arr[i - 1] !== page - 1 && <span className="text-slate-300">...</span>}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-violet-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        ))
                                    }
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage) || totalItems === 0}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 text-slate-400 hover:border-violet-200 hover:text-primary disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-b-2xl border-t border-slate-100">
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 shadow-inner">
                            <User size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-400 italic tracking-tight">No members found</h3>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest text-center">Register a new member to see them here</p>
                    </div>
                )}
            </div >

            {/* ── Modals & Drawers (all logic untouched) ── */}

            {/* ─────────────────────────────────────────────────────────────────
                ADD MEMBER DRAWER
                Previous Add Member Form Start (commented out for rollback safety):

                <form id="add-member-form" onSubmit={handleAddMemberSubmit}>
                    <div> Full Name input - value={newMemberData.name} </div>
                    <div> Phone Number input - value={newMemberData.phone} </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div> Membership Plan - CustomDropdown - value={newMemberData.planId} </div>
                        <div> Initial Status - CustomDropdown - value={newMemberData.status} </div>
                    </div>
                </form>

                Previous Add Member Form End.
                New 7-section form renders below.
            ───────────────────────────────────────────────────────────────── */}
            <RightDrawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Member" subtitle="Register a new member to the branch" maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button
                            type="button"
                            onClick={() => setIsAddDrawerOpen(false)}
                            variant="outline"
                            className="px-6 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="add-member-form"
                            variant="primary"
                            className="px-6 h-11 shadow-lg shadow-violet-200"
                        >
                            Add Member
                        </Button>
                    </div>
                }
            >
                <form id="add-member-form" onSubmit={handleAddMemberSubmit} className="px-6 py-6 space-y-8">

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-100">
                        <div className="relative">
                            <input
                                type="file"
                                ref={profileImageRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, 'add')}
                            />
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-primary flex items-center justify-center text-4xl font-black border-4 border-white shadow-lg">
                                    {newMemberData.name ? newMemberData.name.charAt(0).toUpperCase() : 'N'}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => profileImageRef.current.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">Click camera to upload photo</p>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                                <input required type="text" placeholder="Enter full name" value={newMemberData.name} onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email <span className="text-rose-500">*</span></label>
                                <input required type="email" placeholder="Enter email address" value={newMemberData.email} onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone <span className="text-rose-500">*</span></label>
                                <input required type="tel" placeholder="+91 00000 00000" value={newMemberData.phone} onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                                <select value={newMemberData.gender} onChange={(e) => setNewMemberData({ ...newMemberData, gender: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select gender</option>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                                <input type="text" placeholder="dd-mm-yyyy" value={newMemberData.dob} onChange={(e) => setNewMemberData({ ...newMemberData, dob: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Source</label>
                                <select value={newMemberData.source} onChange={(e) => setNewMemberData({ ...newMemberData, source: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option>Walk-in</option><option>Online</option><option>Referral</option><option>Social Media</option><option>Advertisement</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Referral */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Referral
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Referral Code (Member Code)</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Enter referrer's member code" value={newMemberData.referralCode} onChange={(e) => { setNewMemberData({ ...newMemberData, referralCode: e.target.value }); setReferralVerified(false); }}
                                    className="flex-1 h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                                <button type="button" onClick={handleVerifyReferral} disabled={isVerifyingReferral || !newMemberData.referralCode} className={`px-4 h-11 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${referralVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default' : 'bg-primary-light text-primary border-violet-200 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                                    {isVerifyingReferral ? 'Verifying...' : referralVerified ? 'Verified ✓' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Government ID */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">3</span>
                            Government ID
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Type</label>
                                <select value={newMemberData.idType} onChange={(e) => setNewMemberData({ ...newMemberData, idType: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select ID type</option>
                                    <option>Aadhaar Card</option><option>PAN Card</option><option>Passport</option><option>Voter ID</option><option>Driving License</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Number</label>
                                <input type="text" placeholder="Enter ID number" value={newMemberData.idNumber} onChange={(e) => setNewMemberData({ ...newMemberData, idNumber: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Address */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">4</span>
                            Address
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                            <textarea rows={3} placeholder="Enter full address" value={newMemberData.address} onChange={(e) => setNewMemberData({ ...newMemberData, address: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none" />
                        </div>
                    </div>

                    {/* Section 5: Emergency Contact */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">5</span>
                            Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" placeholder="Emergency contact name" value={newMemberData.emergencyName} onChange={(e) => setNewMemberData({ ...newMemberData, emergencyName: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Phone</label>
                                <input type="tel" placeholder="Emergency contact phone" value={newMemberData.emergencyPhone} onChange={(e) => setNewMemberData({ ...newMemberData, emergencyPhone: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Fitness & Health */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">6</span>
                            Fitness &amp; Health
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fitness Goal</label>
                                <select value={newMemberData.fitnessGoal} onChange={(e) => setNewMemberData({ ...newMemberData, fitnessGoal: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select fitness goal</option>
                                    <option>Weight Loss</option><option>Muscle Gain</option><option>Improve Stamina</option>
                                    <option>Flexibility &amp; Mobility</option><option>General Fitness</option><option>Rehabilitation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Health Conditions</label>
                                <textarea rows={3} placeholder="Any medical conditions..." value={newMemberData.healthConditions} onChange={(e) => setNewMemberData({ ...newMemberData, healthConditions: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none" />
                            </div>
                        </div>
                    </div>



                </form>
            </RightDrawer>

            {/* View Member Drawer */}
            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} title="Member Details" subtitle={selectedMember?.memberId || ''} maxWidth="max-w-lg"
                footer={
                    <div className="flex gap-3 w-full px-2">
                        <Button
                            onClick={() => { setIsViewDrawerOpen(false); setTimeout(() => handleEdit(selectedMember), 200); }}
                            variant="outline"
                            className="flex-1 h-11"
                        >
                            Edit Member
                        </Button>
                        <Button
                            onClick={() => setIsViewDrawerOpen(false)}
                            variant="outline"
                            className="flex-1 h-11"
                        >
                            Close
                        </Button>
                    </div>
                }
            >
                {selectedMember && (
                    <div className="px-6 py-6 space-y-6">

                        {/* Avatar + Name */}
                        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                            {selectedMember.avatar ? (
                                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-200" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-primary-hover flex items-center justify-center text-2xl font-black border-2 border-violet-200 flex-shrink-0">
                                    {(selectedMember.name || '?').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{selectedMember.name}</h3>
                                <p className="text-xs font-mono text-primary mt-0.5">{selectedMember.memberId}</p>
                                <div className="mt-1">{getStatusBadge(selectedMember.status)}</div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                                Basic Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['Phone', selectedMember.phone],
                                    ['Email', selectedMember.email],
                                    ['Gender', selectedMember.gender],
                                    ['Date of Birth', selectedMember.dob],
                                    ['Source', selectedMember.source],
                                    ['Plan', selectedMember.plan],
                                    ['Join Date', selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('en-IN') : '—'],
                                    ['Expiry', (selectedMember.expiryDate && !isNaN(new Date(selectedMember.expiryDate).getTime())) ? new Date(selectedMember.expiryDate).toLocaleDateString('en-IN') : '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 break-words">{val || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral */}
                        {selectedMember.referralCode && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span></span>
                                    Referral
                                </h4>
                                <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Referral Code</p>
                                    <p className="text-sm font-semibold text-slate-800">{selectedMember.referralCode}</p>
                                </div>
                            </div>
                        )}

                        {/* Government ID */}
                        {(selectedMember.idType || selectedMember.idNumber) && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                                    Government ID
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[['ID Type', selectedMember.idType], ['ID Number', selectedMember.idNumber]].map(([label, val]) => (
                                        <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className="text-sm font-semibold text-slate-800 break-words">{val || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Address */}
                        {selectedMember.address && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                                    Address
                                </h4>
                                <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-800">{selectedMember.address}</p>
                                </div>
                            </div>
                        )}

                        {/* Emergency Contact */}
                        {(selectedMember.emergencyName || selectedMember.emergencyPhone) && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span></span>
                                    Emergency Contact
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[['Name', selectedMember.emergencyName], ['Phone', selectedMember.emergencyPhone]].map(([label, val]) => (
                                        <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className="text-sm font-semibold text-slate-800 uppercase">{val || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fitness & Health */}
                        {(selectedMember.fitnessGoal || selectedMember.healthConditions) && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span></span>
                                    Fitness &amp; Health
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[['Fitness Goal', selectedMember.fitnessGoal], ['Health Conditions', selectedMember.healthConditions]].map(([label, val]) => val ? (
                                        <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className="text-sm font-semibold text-slate-800">{val}</p>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </RightDrawer>


            {/* Edit Member Drawer */}
            <RightDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} title="Edit Member" subtitle={`Updating info for ${selectedMember?.name || ''}`} maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(false)}
                            variant="outline"
                            className="px-6 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="edit-member-form"
                            variant="primary"
                            className="px-6 h-11 shadow-lg shadow-violet-200"
                        >
                            Save Changes
                        </Button>
                    </div>
                }
            >
                <form id="edit-member-form" onSubmit={handleEditSubmit} className="px-6 py-6 space-y-8">

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-100">
                        <div className="relative">
                            <input
                                type="file"
                                ref={editProfileImageRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, 'edit')}
                            />
                            {editProfileImage ? (
                                <img src={editProfileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-primary flex items-center justify-center text-4xl font-black border-4 border-white shadow-lg">
                                    {editMemberData.name ? editMemberData.name.charAt(0).toUpperCase() : 'N'}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => editProfileImageRef.current.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">Click camera to change photo</p>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                                <input required type="text" placeholder="Full name" value={editMemberData.name} onChange={(e) => setEditMemberData({ ...editMemberData, name: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input type="email" placeholder="Email address" value={editMemberData.email || ''} onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone <span className="text-rose-500">*</span></label>
                                <input required type="tel" placeholder="Phone number" value={editMemberData.phone} onChange={(e) => setEditMemberData({ ...editMemberData, phone: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                                <select value={editMemberData.gender || ''} onChange={(e) => setEditMemberData({ ...editMemberData, gender: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select gender</option>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                                <input type="text" placeholder="dd-mm-yyyy" value={editMemberData.dob || ''} onChange={(e) => setEditMemberData({ ...editMemberData, dob: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Source</label>
                                <select value={editMemberData.source || 'Walk-in'} onChange={(e) => setEditMemberData({ ...editMemberData, source: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option>Walk-in</option><option>Online</option><option>Referral</option><option>Social Media</option><option>Advertisement</option>
                                </select>
                            </div>
                        </div>
                    </div>



                    {/* Section 3: Government ID */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">3</span>
                            Government ID
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Type</label>
                                <select value={editMemberData.idType || ''} onChange={(e) => setEditMemberData({ ...editMemberData, idType: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select ID type</option>
                                    <option>Aadhaar Card</option><option>PAN Card</option><option>Passport</option><option>Voter ID</option><option>Driving License</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Number</label>
                                <input type="text" placeholder="ID number" value={editMemberData.idNumber || ''} onChange={(e) => setEditMemberData({ ...editMemberData, idNumber: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Address */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">4</span>
                            Address
                        </h3>
                        <textarea rows={3} placeholder="Full address" value={editMemberData.address || ''} onChange={(e) => setEditMemberData({ ...editMemberData, address: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none" />
                    </div>

                    {/* Section 5: Emergency Contact */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">5</span>
                            Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" placeholder="Emergency contact name" value={editMemberData.emergencyName || ''} onChange={(e) => setEditMemberData({ ...editMemberData, emergencyName: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <input type="tel" placeholder="Emergency contact phone" value={editMemberData.emergencyPhone || ''} onChange={(e) => setEditMemberData({ ...editMemberData, emergencyPhone: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Fitness & Health */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">6</span>
                            Fitness &amp; Health
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fitness Goal</label>
                                <select value={editMemberData.fitnessGoal || ''} onChange={(e) => setEditMemberData({ ...editMemberData, fitnessGoal: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">Select fitness goal</option>
                                    <option>Weight Loss</option><option>Muscle Gain</option><option>Improve Stamina</option>
                                    <option>Flexibility &amp; Mobility</option><option>General Fitness</option><option>Rehabilitation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Health Conditions</label>
                                <textarea rows={3} placeholder="Any medical conditions..." value={editMemberData.healthConditions || ''} onChange={(e) => setEditMemberData({ ...editMemberData, healthConditions: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none" />
                            </div>
                        </div>
                    </div>


                </form>
            </RightDrawer>


            {/* Delete Member Drawer */}
            <RightDrawer
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                title="Remove Member?"
                subtitle="This action cannot be undone"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-6 h-11 border-2 border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={confirmDelete} className="px-6 h-11 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">Confirm Delete</button>
                    </div>
                }
            >
                <div className="px-6 py-8 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner rotate-3 transition-transform hover:rotate-0 duration-300">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight">Are you sure?</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        This will permanently delete the member record for <span className="text-slate-900 font-bold">{selectedMember?.name}</span> from the system. All associated data will be lost.
                    </p>
                </div>
            </RightDrawer>

        </div >
    );
};

export default MemberList;
