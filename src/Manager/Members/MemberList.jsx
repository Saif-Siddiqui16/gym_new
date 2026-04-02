import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, 
    FileText, User, Users, CreditCard, ShieldCheck, Dumbbell, Building, Clock, 
    MoreHorizontal, Mail, Phone, Calendar, MapPin, Activity, Award, DollarSign, 
    Layers, Smartphone, History, Unlock, ExternalLink, Edit3, PlusCircle, 
    XCircle, UserMinus, Gift, ArrowRightLeft, Repeat, FileSignature, Printer, 
    ArrowUpCircle, ShoppingCart, Snowflake, Shield, CheckCircle2, Receipt
} from 'lucide-react';
import { getMembers, getMemberById, toggleMemberStatus, deleteMember, createMember, updateMember, renewMembership } from '../../api/manager/managerApi';
import { settleInvoice } from '../../api/finance/financeApi';
import { membershipApi } from '../../api/membershipApi';
import { referralApi } from '../../api/referralApi';
import amenityApi from '../../api/amenityApi';
import { exportCSV, exportPDF } from '../../api/manager/managerExport';
import { BENEFITS } from '../../modules/membership/data/mockMemberships';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';
import { useBranchContext } from '../../context/BranchContext';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { exportPdf } from '../../utils/exportPdf';
import { fetchStaffAPI } from '../../api/admin/adminApi';
import MipsSyncPanel from '../../components/mips/MipsSyncPanel';


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
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [profileActiveTab, setProfileActiveTab] = useState('Overview');
    const [plans, setPlans] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const initialNewMemberData = {
        name: '', phone: '', email: '', gender: '', dob: '', source: 'Walk-in',
        referralCode: '', idType: '', idNumber: '', address: '',
        emergencyName: '', emergencyPhone: '', fitnessGoal: '', healthConditions: '',
        planId: '', duration: 1, // Default duration to 1 month
        trainerId: ''
    };
    const [newMemberData, setNewMemberData] = useState(initialNewMemberData);
    const [editMemberData, setEditMemberData] = useState({ ...initialNewMemberData, status: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [editProfileImage, setEditProfileImage] = useState(null);
    const profileImageRef = React.useRef(null);
    const editProfileImageRef = React.useRef(null);
    const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
    const [referralVerified, setReferralVerified] = useState(false);
    const [isRenewalDrawerOpen, setIsRenewalDrawerOpen] = useState(false);
    const [renewalData, setRenewalData] = useState({ planId: '', duration: 1 });
    const [isRenewing, setIsRenewing] = useState(false);
    const [trainers, setTrainers] = useState([]);

    const [isAssignTrainerDrawerOpen, setIsAssignTrainerDrawerOpen] = useState(false);
    const [quickTrainerId, setQuickTrainerId] = useState('');
    const [isSavingTrainer, setIsSavingTrainer] = useState(false);

    const [isFreezeDrawerOpen, setIsFreezeDrawerOpen] = useState(false);
    const [freezeData, setFreezeData] = useState({ startDate: new Date().toISOString().split('T')[0], days: 30, reason: '' });
    const [isBodyDrawerOpen, setIsBodyDrawerOpen] = useState(false);
    const [bodyData, setBodyData] = useState({ weight: '', bf: '', chest: '', waist: '', arms: '' });

    const [isPTDrawerOpen, setIsPTDrawerOpen] = useState(false);
    const [ptSelection, setPTSelection] = useState({ trainerId: '', sessions: 12, amount: '', description: 'Personal Training Package' });

    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [settlementData, setSettlementData] = useState({ invoiceId: null, method: 'Cash', amount: 0, fullAmount: 0, referenceNumber: '', date: new Date().toISOString().split('T')[0], isPartial: false, balanceDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    const [isSettling, setIsSettling] = useState(false);

    const location = useLocation();
    const { selectedBranch } = useBranchContext();

    // ─── EFFECTS (all logic preserved, untouched) ───
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('add') === 'true') setIsAddDrawerOpen(true);
    }, [location.search]);

    useEffect(() => { loadPlans(); loadTrainers(); }, [selectedBranch]);
    useEffect(() => { loadMembers(); }, [searchTerm, statusFilter, currentPage, itemsPerPage, selectedBranch]);
    useEffect(() => {
        const close = () => setActiveMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const loadTrainers = async () => {
        try {
            const staff = await fetchStaffAPI(selectedBranch === 'all' ? undefined : selectedBranch);
            setTrainers(staff.filter(s => s.role === 'TRAINER'));
        } catch (error) {
            console.error("Error loading trainers:", error);
        }
    };

    // ─── HANDLERS (all logic preserved, untouched) ───
    const loadPlans = async () => {
        setPlansLoading(true);
        try {
            const params = {
                branchId: selectedBranch === 'all' ? undefined : selectedBranch
            };
            const [plansResult, amenitiesResult] = await Promise.allSettled([
                membershipApi.getPlans(params),
                amenityApi.getAll()
            ]);
            
            if (plansResult.status === 'fulfilled') {
                const data = plansResult.value;
                setPlans(Array.isArray(data) ? data : (data?.data || []));
            } else {
                console.error('[MemberList] Failed to load plans:', plansResult.reason);
            }

            if (amenitiesResult.status === 'fulfilled') {
                const data = amenitiesResult.value;
                setAmenities(Array.isArray(data) ? data : (data?.data || []));
            } else {
                console.error('[MemberList] Failed to load amenities:', amenitiesResult.reason);
            }
        } catch (error) {
            console.error("Error loading metadata:", error);
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

    const openSettleModal = (inv) => {
        const balanceVal = Number(inv.balance);
        const amountVal = Number(inv.amount);
        const payableAmount = balanceVal > 0 ? balanceVal : amountVal;
        setSettlementData({
            invoiceId: inv.id,
            method: 'Cash',
            amount: payableAmount,
            fullAmount: payableAmount,
            referenceNumber: '',
            isPartial: false,
            date: new Date().toISOString().split('T')[0],
            balanceDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setIsSettleModalOpen(true);
    };

    const handleSettleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSettling(true);
            await settleInvoice(settlementData.invoiceId, {
                method: settlementData.method,
                referenceNumber: settlementData.referenceNumber,
                amount: settlementData.amount,
                date: settlementData.date,
                balanceDueDate: settlementData.isPartial ? settlementData.balanceDueDate : null
            });
            toast.success("Payment recorded successfully!");
            setIsSettleModalOpen(false);
            const updated = await getMemberById(selectedMember.id);
            setSelectedMember(updated);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSettling(false);
        }
    };

    const handleRenewalSubmit = async (e) => {
        e.preventDefault();
        if (!renewalData.planId) {
            toast.error("Please select a plan");
            return;
        }
        try {
            setIsRenewing(true);
            const payload = {
                memberId: selectedMember.id,
                planId: parseInt(renewalData.planId),
                duration: parseInt(renewalData.duration)
            };
            await renewMembership(payload);
            toast.success("Membership assigned successfully!");
            setIsRenewalDrawerOpen(false);
            loadMembers();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to assign membership");
        } finally {
            setIsRenewing(false);
        }
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

    const handleQuickAssignTrainer = async () => {
        try {
            setIsSavingTrainer(true);
            await updateMember(selectedMember.id, { trainerId: quickTrainerId });
            toast.success("Trainer assigned successfully!");
            setIsAssignTrainerDrawerOpen(false);
            loadMembers();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to assign trainer");
        } finally {
            setIsSavingTrainer(false);
        }
    };

    const handleFreezeSubmit = async (e) => {
        e.preventDefault();
        toast.success(`Plan frozen for ${freezeData.days} days starting ${freezeData.startDate}`);
        setIsFreezeDrawerOpen(false);
        // await freezeMemberPlan(selectedMember.id, freezeData);
    };

    const handleBodySubmit = async (e) => {
        e.preventDefault();
        toast.success("Body measurements recorded successfully!");
        setIsBodyDrawerOpen(false);
    };

    const handleCancelPlan = () => {
        if (window.confirm(`Are you sure you want to CANCEL the active plan for ${selectedMember.name}? This will stop all benefits immediately.`)) {
            toast.success("Plan cancelled successfully");
            loadMembers();
        }
    };

    const handleDeactivateMember = async () => {
        if (window.confirm(`Deactivate ${selectedMember.name}? They will no longer be able to check-in.`)) {
            await handleToggleStatus(selectedMember.id);
            setIsViewDrawerOpen(false);
        }
    };

    const handlePTSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMember(selectedMember.id, { 
                trainerId: ptSelection.trainerId,
                ptSessions: (Number(selectedMember.ptSessions) || 0) + Number(ptSelection.sessions)
            });
            toast.success(`Assigned ${ptSelection.sessions} sessions with Personal Trainer successfully!`);
            setIsPTDrawerOpen(false);
            loadMembers();
        } catch (error) {
            toast.error("Failed to assign PT");
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
    const handleExport = () => {
        if (members.length === 0) return toast.error('No members to export');
        const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Branch', 'Status', 'Join Date'];
        const rows = members.map(m => [
            m.memberId,
            m.name,
            m.email,
            m.phone,
            m.branch || 'Main',
            m.status,
            m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : '—'
        ]);

        exportPdf({
            title: 'Member List Report',
            filename: `members_${new Date().toISOString().split('T')[0]}`,
            headers,
            rows,
            gymName: "Gym Academy"
        });
    };
    const handleView = async (member) => {
        try {
            setSelectedMember(member); // Set basic info first for instant feeling
            setIsViewDrawerOpen(true);
            setProfileActiveTab('Overview');
            
            // Then fetch rich data
            const data = await getMemberById(member.id);
            setSelectedMember(data);
        } catch (error) {
            console.error('Failed to fetch rich member data', error);
            // Fallback: stick with the basic data from the list
        }
    };
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
            startDate: member.joinDate ? member.joinDate.split('T')[0] : '',
            trainerId: member.trainerId || ''
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

            // Ensure plan values are passed directly (if chosen)
            if (newMemberData.planId) {
                memberPayload.planId = newMemberData.planId;
                memberPayload.duration = newMemberData.duration || 1;
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
        switch (status?.toLowerCase()) {
            case 'active': return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                    active
                </span>
            );
            case 'inactive': return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-400 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></span>
                    inactive
                </span>
            );
            case 'frozen': return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-500 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
                    frozen
                </span>
            );
            case 'expired': return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
                    expired
                </span>
            );
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-200">unknown</span>;
        }
    };

    const getPlanBadge = (plan) => {
        if (!plan || plan === 'No Plan') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-400 border border-dashed border-slate-200 uppercase">No Plan</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">{plan}</span>;
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
                        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-primary transition-all">
                            <FileText size={14} /><span>Export as PDF</span>
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
                                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-all duration-150 border-b border-slate-100">
                                        <td className="px-6 py-4" data-label="Member">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">{(member.name || '?').charAt(0).toUpperCase()}</div>
                                                    )}
                                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${member.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{member.name}</span>
                                                    <span className="text-xs text-slate-400">{member.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Code">
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                {member.memberId || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Branch">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                <Building size={14} className="text-slate-300" />
                                                {member.branch || 'Main Branch'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(member.id); }}>
                                                {getStatusBadge(member.status)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4" data-label="Plan">
                                            {getPlanBadge(member.plan)}
                                        </td>
                                        <td className="px-6 py-4" data-label="Days Left">
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${member.daysLeft > 30 ? 'text-green-500' : member.daysLeft > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                                                <Clock size={14} />
                                                {member.daysLeft ? `${member.daysLeft}d` : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Joined">
                                            <span className="text-sm text-slate-500 font-medium">
                                                {member.joinDate ? new Date(member.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Actions">
                                            <div className="flex items-center gap-2 relative">
                                                <button onClick={() => handleView(member)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View"><Eye size={18} /></button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === member.id ? null : member.id); }}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                    title="More Options"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {activeMenu === member.id && (
                                                    <div
                                                        className="absolute right-0 top-8 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 min-w-[140px] overflow-hidden"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => { setActiveMenu(null); handleEdit(member); }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                                                        >
                                                            <Edit3 size={14} className="text-indigo-400" /> Edit
                                                        </button>
                                                        <div className="h-px bg-slate-100 mx-3" />
                                                        <button
                                                            onClick={() => { setActiveMenu(null); handleDelete(member); }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
                                                        >
                                                            <Trash2 size={14} className="text-rose-400" /> Delete
                                                        </button>
                                                    </div>
                                                )}
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
                                <input type="date" value={newMemberData.dob} onChange={(e) => setNewMemberData({ ...newMemberData, dob: e.target.value })}
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

                    {/* Section 2: Membership Plan */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Membership Plan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Plan</label>
                                <select value={newMemberData.planId} onChange={(e) => setNewMemberData({ ...newMemberData, planId: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">No Plan (Add Later)</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}/mo</option>)}
                                </select>
                            </div>
                            {newMemberData.planId && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Billing Cycles <span className="text-rose-500">*</span></label>
                                    <select value={newMemberData.duration} onChange={(e) => setNewMemberData({ ...newMemberData, duration: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                        <option value="1">1 Cycle</option>
                                        <option value="2">2 Cycles</option>
                                        <option value="3">3 Cycles</option>
                                        <option value="6">6 Cycles</option>
                                        <option value="12">12 Cycles</option>
                                    </select>
                                </div>
                            )}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign General Trainer</label>
                                <select value={newMemberData.trainerId} onChange={(e) => setNewMemberData({ ...newMemberData, trainerId: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all">
                                    <option value="">No Trainer Assigned</option>
                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Referral */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">3</span>

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
            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} title="Member Profile" subtitle="" maxWidth="max-w-2xl" showHeader={false}>
                {selectedMember && (
                    <div className="flex flex-col h-full bg-slate-50/30">
                        {/* Profile Header */}
                        <div className="bg-white px-6 pt-10 pb-6 border-b border-slate-100 relative">
                            <button onClick={() => setIsViewDrawerOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                <XCircle size={20} />
                            </button>
                            
                            <div className="flex items-start gap-6">
                                <div className="relative shrink-0">
                                    {selectedMember.avatar ? (
                                        <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl">
                                            {(selectedMember.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${selectedMember.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-slate-800">{selectedMember.name}</h2>
                                        {getStatusBadge(selectedMember.status)}
                                        <div className="flex items-center gap-1.5 ml-2">
                                            <button 
                                                onClick={() => { setIsViewDrawerOpen(false); setTimeout(() => handleEdit(selectedMember), 200); }} 
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
                                                title="Edit Profile"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => { setIsViewDrawerOpen(false); setTimeout(() => setIsRenewalDrawerOpen(true), 200); }} 
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
                                                title="Assign Membership / Renew"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    await handleToggleStatus(selectedMember.id);
                                                    const updated = await getMemberById(selectedMember.id);
                                                    setSelectedMember(updated);
                                                }} 
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
                                                title="Toggle Active/Inactive"
                                            >
                                                <ArrowRightLeft size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedMember.memberId || 'MAIN-00000'}</span>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <Mail size={14} className="text-slate-300" />
                                                {selectedMember.email || 'No email provided'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <Phone size={14} className="text-slate-300" />
                                                {selectedMember.phone || 'No phone provided'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { 
                                        label: 'Days Left', 
                                        value: `${selectedMember.daysLeft || '0'} Days`, 
                                        sub: selectedMember.planName || 
                                             (typeof selectedMember.plan === 'string' ? selectedMember.plan : selectedMember.plan?.name) || 
                                             selectedMember.activeMembership?.plan?.name || 
                                             'No Plan', 
                                        color: 'text-green-500' 
                                    },
                                    { label: 'PT Sessions', value: selectedMember.ptSessions || '0', sub: 'Active Sessions', color: 'text-slate-800' },
                                    { label: 'Recent Visits', value: '0', sub: 'Recent Visits', color: 'text-indigo-600' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1">{stat.sub}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => { setIsViewDrawerOpen(false); setIsRenewalDrawerOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all group">
                                    <ArrowUpCircle size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Upgrade Plan
                                </button>
                                <button onClick={() => setIsPTDrawerOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all group">
                                    <ShoppingCart size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Assign PT (sessions)
                                </button>
                                <button onClick={() => setIsFreezeDrawerOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all group">
                                    <Snowflake size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Freeze Plan
                                </button>
                                <button onClick={() => { setIsViewDrawerOpen(false); setIsAssignTrainerDrawerOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all group">
                                    <User size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Assign Trainer
                                </button>
                                <button onClick={() => setIsBodyDrawerOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all group">
                                    <Activity size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" /> Record Body
                                </button>
                                <button onClick={handleDeactivateMember} className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-rose-500 shadow-sm transition-all group">
                                    <UserMinus size={16} className="text-rose-300 group-hover:text-rose-500 transition-colors" /> Deactivate Member
                                </button>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="border-b border-slate-100">
                                <div className="flex gap-4 overflow-x-auto scroller-hidden">
                                    {['Overview', 'Plan', 'Benefits', 'Pay'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setProfileActiveTab(tab)}
                                            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${profileActiveTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                {profileActiveTab === 'Overview' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Health Goal</span>
                                                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{selectedMember.fitnessGoal || 'Not Set'}</span>
                                            </div>
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Group</span>
                                                <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{selectedMember.bloodGroup || '—'}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <User size={14} className="text-indigo-400" /> Personal Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gender</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.gender || 'Not Specified'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DOB</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.dob || 'Not specified'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Health Conditions</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.healthConditions || 'None Reported'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Source</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.source || 'Walk-in'}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Address</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.address || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Calendar size={14} className="text-indigo-400" /> Registration Details
                                            </h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Joined Date</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('en-IN') : '—'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created By</span>
                                                    <span className="text-sm font-bold text-slate-700">{selectedMember.createdBy?.name || 'Admin'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profileActiveTab === 'Plan' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 mb-4 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                                <Award size={80} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                                            {selectedMember.planName || 
                                                             (typeof selectedMember.plan === 'string' ? selectedMember.plan : selectedMember.plan?.name) || 
                                                             selectedMember.activeMembership?.plan?.name || 
                                                             'No Active Plan'}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {(selectedMember.plan?.price || selectedMember.activeMembership?.totalAmount) 
                                                                ? `₹${selectedMember.plan?.price || selectedMember.activeMembership?.totalAmount} Membership` 
                                                                : 'Current Active Membership'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {selectedMember.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Joined On</span>
                                                        <span className="text-sm font-bold text-slate-700">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                                                    </div>
                                                    <div className="p-3">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Expires On</span>
                                                        <span className="text-sm font-bold text-rose-500">{selectedMember.expiryDate ? new Date(selectedMember.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar size={14} className="text-indigo-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {(() => {
                                                        // 1. Try direct fields
                                                        const direct = selectedMember.duration || selectedMember.plan?.duration || selectedMember.activeMembership?.plan?.duration;
                                                        if (direct) return `${direct} ${selectedMember.durationType || selectedMember.plan?.durationType || selectedMember.activeMembership?.plan?.durationType || 'Days'}`;

                                                        // 2. Try lookup in plans array
                                                        const pName = selectedMember.planName || (typeof selectedMember.plan === 'string' ? selectedMember.plan : selectedMember.plan?.name);
                                                        const matchedPlan = plans.find(p => p.name === pName);
                                                        if (matchedPlan) return `${matchedPlan.duration} ${matchedPlan.durationType}`;

                                                        // 3. Fallback: Calculate from dates
                                                        if (selectedMember.joinDate && selectedMember.expiryDate) {
                                                            const start = new Date(selectedMember.joinDate);
                                                            const end = new Date(selectedMember.expiryDate);
                                                            const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
                                                            if (diff > 0) return `${diff} Days`;
                                                        }

                                                        return 'N/A';
                                                    })()}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign size={14} className="text-indigo-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {(() => {
                                                        // 1. Try direct fields
                                                        const price = selectedMember.price || selectedMember.totalAmount || selectedMember.amount || selectedMember.plan?.price || selectedMember.activeMembership?.totalAmount;
                                                        if (price) return `₹${price}`;

                                                        // 2. Try lookup in plans array
                                                        const pName = selectedMember.planName || (typeof selectedMember.plan === 'string' ? selectedMember.plan : selectedMember.plan?.name);
                                                        const matchedPlan = plans.find(p => p.name === pName);
                                                        if (matchedPlan) return `₹${matchedPlan.price}`;

                                                        return 'Free';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Smartphone size={14} className="text-indigo-400" /> Digital Access & Features
                                            </h4>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Mobile App Access', val: 'Full Access' },
                                                    { label: 'Biometric Login', val: selectedMember.mipsPersonSn ? 'Registered' : 'Pending' },
                                                    { label: 'Trainer Support', val: selectedMember.trainer?.name || selectedMember.trainerName || 'Not Assigned' }
                                                ].map((item, id) => (
                                                    <div key={id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                        <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                                        <span className="text-xs font-bold text-slate-700">{item.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profileActiveTab === 'Benefits' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Plan Entitlements</h4>
                                            {(!selectedMember.benefits || selectedMember.benefits === '[]') && selectedMember.plan?.benefits && (
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 italic">Plan Default</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {(() => {
                                                const parseData = (data) => {
                                                    if (!data) return [];
                                                    try {
                                                        const p = typeof data === 'string' ? JSON.parse(data) : data;
                                                        return Array.isArray(p) ? p : [];
                                                    } catch (e) { return []; }
                                                };

                                                const mBenefits = parseData(selectedMember.benefits);
                                                
                                                // Robust Plan Benefits Lookup
                                                const pName = selectedMember.planName || (typeof selectedMember.plan === 'string' ? selectedMember.plan : selectedMember.plan?.name);
                                                const matchedPlan = plans.find(p => p.name === pName);
                                                const pBenefits = parseData(selectedMember.plan?.benefits || selectedMember.activeMembership?.plan?.benefits || matchedPlan?.benefits);
                                                
                                                // Use member benefits if not empty, else plan benefits
                                                const benefitsArray = (mBenefits.length > 0) ? mBenefits : pBenefits;

                                                if (benefitsArray.length === 0) {
                                                    return (
                                                        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                                                            <Shield size={32} className="text-slate-200 mb-2" strokeWidth={1.5} />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No specific benefits listed</p>
                                                        </div>
                                                    );
                                                }

                                                return benefitsArray.map((benefit, i) => {
                                                    // NEW FORMAT: { id, name, description, limit }
                                                    // OLD FORMAT: { id, limit } — needs lookup
                                                    
                                                    const benefitId = typeof benefit === 'object' ? benefit.id : benefit;
                                                    
                                                    // 1. Use name stored directly in benefit JSON (new format)
                                                    let name = typeof benefit === 'object' ? (benefit.name || '') : '';
                                                    let description = typeof benefit === 'object' ? (benefit.description || '') : '';
                                                    let limit = typeof benefit === 'object' ? benefit.limit : null;
                                                    
                                                    // 2. If name is missing (old format), look up from live amenities list
                                                    if (!name) {
                                                        const liveAmenity = amenities.find(a => String(a.id) === String(benefitId));
                                                        name = liveAmenity?.name || `Benefit #${benefitId}`;
                                                        description = description || liveAmenity?.description || '';
                                                    }
                                                    
                                                    // Safety: ensure primitives
                                                    if (typeof name === 'object') name = name?.name || String(benefitId);
                                                    if (typeof limit === 'object') limit = limit?.value || null;
                                                    const limitStr = limit ? String(limit) : null;

                                                    return (
                                                        <div key={i} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-100 group hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover:scale-110 transition-transform">
                                                                <CheckCircle2 size={18} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{String(name)}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                    {limitStr ? `Limit: ${limitStr}` : description || 'Included in Plan'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {profileActiveTab === 'Body' && null}

                                {profileActiveTab === 'Pay' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {/* Payment Summary Cards */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {(() => {
                                                const invoices = selectedMember.invoices || [];
                                                const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
                                                const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
                                                const totalPending = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
                                                
                                                const lastPaidInv = invoices.find(inv => inv.status === 'Paid' || inv.paidAmount > 0);
                                                const lastPaidDate = lastPaidInv?.paidDate || lastPaidInv?.updatedAt;

                                                return [
                                                    { label: 'Total Billed', value: `₹${totalBilled.toLocaleString()}`, color: 'text-slate-900', bg: 'bg-slate-50' },
                                                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                                                    { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, color: 'text-rose-600', bg: 'bg-rose-50/50' },
                                                    { label: 'Last Payment', value: lastPaidDate ? new Date(lastPaidDate).toLocaleDateString() : 'None', color: 'text-indigo-600', bg: 'bg-indigo-50/50' }
                                                ].map((stat, i) => (
                                                    <div key={i} className={`${stat.bg} p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center`}>
                                                        <span className={`text-xs sm:text-sm font-black ${stat.color}`}>{stat.value}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>

                                        {/* Membership Invoices */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                    <History size={14} className="text-violet-400" /> Payment History
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Member ID: {selectedMember.memberId}</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {selectedMember.invoices?.length > 0 ? (
                                                    selectedMember.invoices.map((inv, idx) => {
                                                        const isPaid = inv.status === 'Paid';
                                                        const isPartial = Number(inv.balance) > 0 && Number(inv.paidAmount) > 0;
                                                        const isUnpaid = !isPaid && !isPartial;
                                                        return (
                                                        <div key={idx} className={`flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isPaid ? 'border-emerald-100' : isPartial ? 'border-amber-100' : 'border-rose-100'}`}>
                                                            {/* Status bar */}
                                                            <div className={`h-1 w-full ${isPaid ? 'bg-emerald-400' : isPartial ? 'bg-amber-400' : 'bg-rose-400'}`} />

                                                            <div className="p-4 space-y-3">
                                                                {/* Header row */}
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inv.invoiceNumber}</p>
                                                                        <p className="text-xs font-black text-slate-800 mt-0.5">{inv.notes || inv.paymentMode || 'Membership Payment'}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isPaid ? 'bg-emerald-50 text-emerald-600' : isPartial ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                                                            {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                                                                        </span>
                                                                        {!isPaid && (
                                                                            <button onClick={() => openSettleModal(inv)} className="w-7 h-7 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all" title="Record Payment">
                                                                                <CreditCard size={13} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Amount grid */}
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                                                        <p className="text-xs font-black text-slate-800 mt-0.5">₹{Number(inv.amount).toLocaleString()}</p>
                                                                    </div>
                                                                    <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                                                                        <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Paid</p>
                                                                        <p className="text-xs font-black text-emerald-700 mt-0.5">₹{Number(inv.paidAmount || (isPaid ? inv.amount : 0)).toLocaleString()}</p>
                                                                    </div>
                                                                    <div className={`rounded-xl p-2.5 text-center ${Number(inv.balance) > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                                                                        <p className={`text-[8px] font-bold uppercase tracking-widest ${Number(inv.balance) > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Balance</p>
                                                                        <p className={`text-xs font-black mt-0.5 ${Number(inv.balance) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{Number(inv.balance || 0).toLocaleString()}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Date info */}
                                                                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Invoice Date</p>
                                                                            <p className="text-[10px] font-bold text-slate-600">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                        </div>
                                                                        {inv.paidDate && (
                                                                            <div>
                                                                                <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Paid On</p>
                                                                                <p className="text-[10px] font-bold text-emerald-600">{new Date(inv.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {inv.dueDate && !isPaid && (
                                                                        <div className="text-right">
                                                                            <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">{isPartial ? 'Next Due' : 'Due Date'}</p>
                                                                            <p className="text-[10px] font-bold text-rose-600">{new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Items breakdown */}
                                                                {inv.items?.length > 0 && (
                                                                    <div className="pt-2 border-t border-slate-50 space-y-1.5">
                                                                        {inv.items.map((item, i) => (
                                                                            <div key={i} className="flex items-center justify-between">
                                                                                <p className="text-[10px] font-bold text-slate-500">{item.description}</p>
                                                                                <p className="text-[10px] font-black text-slate-700">₹{Number(item.amount).toLocaleString()}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Payment mode */}
                                                                <div className="flex items-center gap-1.5">
                                                                    <CreditCard size={10} className="text-slate-300" />
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{inv.paymentMode || 'Cash'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                                                        <CreditCard size={32} className="text-slate-200 mb-2" strokeWidth={1.5} />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">No membership payments yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                            {/* Store Orders History */}
                                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 px-1 flex items-center gap-2">
                                                    <ShoppingCart size={14} className="text-emerald-400" /> Store Purchases
                                                </h4>
                                                <div className="space-y-2.5">
                                                    {selectedMember.storeOrders?.length > 0 ? (
                                                        selectedMember.storeOrders.map((order, idx) => (
                                                            <div key={idx} className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                                                            <ShoppingCart size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Order #{order.id}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} • {order.paymentMode}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right flex items-center gap-3">
                                                                        <p className="text-sm font-black text-emerald-600">₹{order.total}</p>
                                                                        <button 
                                                                            onClick={async () => {
                                                                                try {
                                                                                    const { fetchOrderById } = await import('../../api/storeApi');
                                                                                    const fullOrder = await fetchOrderById(order.id);
                                                                                    const { exportPdf } = await import('../../utils/exportPdf');
                                                                                    exportPdf({
                                                                                        title: 'Store Order',
                                                                                        filename: `ORDER_${fullOrder.id}`,
                                                                                        headers: ["Product", "Qty", "Price", "Subtotal"],
                                                                                        rows: (fullOrder.items || []).map(it => [it.product?.name || 'Product', it.quantity, it.price, it.quantity * it.price]),
                                                                                        gymName: "Gym Academy"
                                                                                    });
                                                                                } catch (e) { toast.error("Failed to download order"); }
                                                                            }}
                                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-300 hover:text-emerald-500 border border-slate-100 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                                        >
                                                                            <Download size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {order.items?.map((item, i) => (
                                                                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                                                                            <span className="text-emerald-500">{item.quantity}x</span>
                                                                            {item.product?.name || 'Item'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                                                            <ShoppingCart size={32} className="text-slate-200 mb-2" strokeWidth={1.5} />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">No store purchases found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                    </div>
                                )}
                            </div>
                            
                            <MipsSyncPanel type="member" id={selectedMember.id} name={selectedMember.name} branchId={selectedMember.branchId} />
                        </div>
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
                                <input type="date" value={editMemberData.dob || ''} onChange={(e) => setEditMemberData({ ...editMemberData, dob: e.target.value })}
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

                    {/* Section 2: Trainer Assignment */}
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Assign General Trainer
                        </h3>
                        <div>
                            <select value={editMemberData.trainerId || ''} onChange={(e) => setEditMemberData({ ...editMemberData, trainerId: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-semibold">
                                <option value="">-- No Trainer Assigned --</option>
                                {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>)}
                            </select>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 italic capitalize">Responsible for general tracking & progress</p>
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


            {/* Settle Invoice Drawer */}
            <RightDrawer
                isOpen={isSettleModalOpen}
                onClose={() => setIsSettleModalOpen(false)}
                title="Record Payment"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSettleSubmit} className="p-8 space-y-8">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Payable</p>
                            <h3 className="text-2xl font-black text-emerald-700">₹{Number(settlementData.fullAmount || settlementData.amount).toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-100">
                            <Receipt size={24} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Number(settlementData.fullAmount) > 0 && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partial Payment</p>
                                    <p className="text-[11px] font-bold text-slate-600">Pay only a portion now</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettlementData(p => ({ ...p, isPartial: !p.isPartial, amount: !p.isPartial ? p.fullAmount / 2 : p.fullAmount }))}
                                    className={`w-12 h-6 rounded-full transition-all relative ${settlementData.isPartial ? 'bg-primary' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settlementData.isPartial ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        )}

                        {settlementData.isPartial && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Pay Now (₹)</label>
                                    <input type="number" required min="1" max={settlementData.fullAmount} value={settlementData.amount} onChange={e => setSettlementData(p => ({ ...p, amount: parseFloat(e.target.value) }))} className="w-full h-14 px-5 bg-primary-light border border-violet-100 rounded-2xl text-[13px] font-bold text-primary focus:outline-none focus:border-primary transition-all" />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remaining Balance</label>
                                    <div className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center text-[13px] font-bold text-slate-400">
                                        ₹{(Number(settlementData.fullAmount) - Number(settlementData.amount || 0)).toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1">Next Due Date *</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={settlementData.balanceDueDate} onChange={e => setSettlementData(p => ({ ...p, balanceDueDate: e.target.value }))} className="w-full h-14 px-5 bg-rose-50 border border-rose-100 rounded-2xl text-[13px] font-bold text-rose-600 focus:outline-none focus:border-rose-400 transition-all" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Cash', 'UPI', 'QR Code', 'Card', 'Online Link'].map(m => (
                                    <button key={m} type="button" onClick={() => setSettlementData(p => ({ ...p, method: m }))} className={`px-4 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${settlementData.method === m ? 'border-primary bg-primary text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {settlementData.method !== 'Cash' && (
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference / Transaction ID</label>
                                <input type="text" required value={settlementData.referenceNumber} onChange={e => setSettlementData(p => ({ ...p, referenceNumber: e.target.value }))} placeholder="Enter TNX ID..." className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Date</label>
                            <input type="date" required value={settlementData.date} onChange={e => setSettlementData(p => ({ ...p, date: e.target.value }))} className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={isSettling} loading={isSettling} variant="primary" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">
                            Complete Settlement
                        </Button>
                    </div>
                </form>
            </RightDrawer>

            {/* Assign Membership Drawer */}
            <RightDrawer
                isOpen={isRenewalDrawerOpen}
                onClose={() => setIsRenewalDrawerOpen(false)}
                title="Assign Membership"
                subtitle={`Assigning plan to ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button type="button" onClick={() => setIsRenewalDrawerOpen(false)} variant="outline">Cancel</Button>
                        <Button
                            type="submit"
                            form="renewal-form"
                            variant="primary"
                            disabled={isRenewing}
                            className="shadow-lg shadow-emerald-200"
                        >
                            {isRenewing ? 'Assigning...' : 'Assign Plan'}
                        </Button>
                    </div>
                }
            >
                <form id="renewal-form" onSubmit={handleRenewalSubmit} className="px-6 py-8 space-y-6">
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Activation Flow</p>
                            <h4 className="text-sm font-bold text-slate-800">Assign a new membership cycle</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Select Plan <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select
                                    required
                                    value={renewalData.planId}
                                    onChange={(e) => setRenewalData({ ...renewalData, planId: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 text-sm font-semibold transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                >
                                    <option value="">Choose a plan...</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price} ({plan.duration} {plan.durationType})</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Quantity/Multiplier (Cycles)</label>
                            <input
                                type="number"
                                min="1"
                                value={renewalData.duration}
                                onChange={(e) => setRenewalData({ ...renewalData, duration: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            />
                            <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 italic">Note: Duration will be multiplied based on the selected plan's period.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                            <span className="text-xl font-black text-slate-800">
                                ₹{renewalData.planId && plans.find(p => p.id == renewalData.planId)
                                    ? (plans.find(p => p.id == renewalData.planId).price * renewalData.duration).toLocaleString()
                                    : '0'}
                            </span>
                        </div>
                    </div>
                </form>
            </RightDrawer>

            {/* Assign Trainer Drawer (Quick) */}
            <RightDrawer
                isOpen={isAssignTrainerDrawerOpen}
                onClose={() => setIsAssignTrainerDrawerOpen(false)}
                title="Assign General Trainer"
                subtitle={`Direct assignment for ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button type="button" onClick={() => setIsAssignTrainerDrawerOpen(false)} variant="outline">Cancel</Button>
                        <Button
                            onClick={handleQuickAssignTrainer}
                            variant="primary"
                            disabled={isSavingTrainer}
                            className="shadow-lg shadow-violet-200"
                        >
                            {isSavingTrainer ? 'Saving...' : 'Update Trainer'}
                        </Button>
                    </div>
                }
            >
                <div className="px-6 py-8 space-y-6">
                    <div className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm mb-4">
                            <Dumbbell size={32} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">Select General Trainer</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">Pick a trainer responsible for this member's growth and tracking.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Choose Specialist</label>
                        <select
                            value={quickTrainerId}
                            onChange={(e) => setQuickTrainerId(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-primary text-sm font-semibold transition-all outline-none bg-slate-50/50"
                        >
                            <option value="">No Trainer Assigned</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </RightDrawer>

            {/* Freeze Plan Drawer */}
            <RightDrawer
                isOpen={isFreezeDrawerOpen}
                onClose={() => setIsFreezeDrawerOpen(false)}
                title="Freeze Plan"
                subtitle={`Suspend membership for ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button type="button" onClick={() => setIsFreezeDrawerOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={handleFreezeSubmit} variant="primary" className="shadow-lg shadow-blue-200">Confirm Freeze</Button>
                    </div>
                }
            >
                <div className="px-6 py-8 space-y-6">
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                            <Snowflake size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Membership Suspend</p>
                            <h4 className="text-sm font-bold text-slate-800">Pause the current plan cycle</h4>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                            <input type="date" value={freezeData.startDate} onChange={(e) => setFreezeData({...freezeData, startDate: e.target.value})}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 text-sm font-semibold outline-none bg-slate-50/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Duration (Days)</label>
                            <input type="number" value={freezeData.days} onChange={(e) => setFreezeData({...freezeData, days: e.target.value})}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 text-sm font-semibold outline-none bg-slate-50/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Reason</label>
                            <textarea value={freezeData.reason} onChange={(e) => setFreezeData({...freezeData, reason: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-semibold outline-none bg-slate-50/50 h-24 resize-none" placeholder="Medical, Vacation, etc..."></textarea>
                        </div>
                    </div>
                </div>
            </RightDrawer>

            {/* Body Measurement Drawer */}
            <RightDrawer
                isOpen={isBodyDrawerOpen}
                onClose={() => setIsBodyDrawerOpen(false)}
                title="Body Measurements"
                subtitle={`Track progress for ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button type="button" onClick={() => setIsBodyDrawerOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={handleBodySubmit} variant="primary" className="shadow-lg shadow-emerald-200">Save Progress</Button>
                    </div>
                }
            >
                <div className="px-6 py-8 space-y-6">
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                            <Activity size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Record new fitness stats</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                            <input type="number" placeholder="70" className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 text-sm font-bold bg-slate-50/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Body Fat (%)</label>
                            <input type="number" placeholder="15" className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 text-sm font-bold bg-slate-50/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waist (in)</label>
                            <input type="number" placeholder="32" className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 text-sm font-bold bg-slate-50/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chest (in)</label>
                            <input type="number" placeholder="40" className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 text-sm font-bold bg-slate-50/50" />
                        </div>
                    </div>
                </div>
            </RightDrawer>

            {/* Personal Trainer Assignment Drawer */}
            <RightDrawer
                isOpen={isPTDrawerOpen}
                onClose={() => setIsPTDrawerOpen(false)}
                title="Personal Trainer Assignment"
                subtitle={`Assign dedicated coach for ${selectedMember?.name}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end px-2">
                        <Button type="button" onClick={() => setIsPTDrawerOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={handlePTSubmit} variant="primary" className="shadow-lg shadow-indigo-200">Assign Sessions</Button>
                    </div>
                }
            >
                <div className="px-6 py-8 space-y-6">
                    <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">PT Enrollment</p>
                            <h4 className="text-sm font-bold text-slate-800">Assign Coach & Session Count</h4>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Select Coach</label>
                            <select 
                                value={ptSelection.trainerId} 
                                onChange={(e) => setPTSelection({...ptSelection, trainerId: e.target.value})}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 text-sm font-semibold outline-none bg-slate-50/50 appearance-none cursor-pointer"
                            >
                                <option value="">Choose a Trainer...</option>
                                {trainers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'PT Specialist'})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Session Count</label>
                                <input type="number" value={ptSelection.sessions} onChange={(e) => setPTSelection({...ptSelection, sessions: e.target.value})}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 text-sm font-semibold outline-none bg-slate-50/50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Package Price (₹)</label>
                                <input type="number" value={ptSelection.amount} onChange={(e) => setPTSelection({...ptSelection, amount: e.target.value})}
                                    placeholder="Enter Amount" className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 text-sm font-semibold outline-none bg-slate-50/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>

        </div >
    );
};

export default MemberList;
