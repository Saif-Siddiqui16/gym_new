import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, TrendingUp, CheckCircle, Search, Filter, BarChart3, Mail, MoreHorizontal, Loader2, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import RightDrawer from '../../../components/common/RightDrawer';
import StatsCard from '../../../modules/dashboard/components/StatsCard';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import MarkAsLostModal from '../components/MarkAsLostModal';
import ConvertLeadModal from '../components/ConvertLeadModal';
import { toast } from 'react-hot-toast';

const LeadsPipeline = () => {
    const { selectedBranch } = useBranchContext();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const [showLostModal, setShowLostModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'Walk-in',
        notes: '',
        status: 'New',
        assignedTo: ''
    });

    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [showLogDrawer, setShowLogDrawer] = useState(false);
    const [leadHistory, setLeadHistory] = useState(null);
    const [logData, setLogData] = useState({
        notes: '',
        nextDate: '',
        nextTime: '',
        status: ''
    });

    useEffect(() => {
        fetchLeads();
        fetchStaff();
    }, [selectedBranch]);

    const fetchStaff = async () => {
        try {
            const response = await apiClient.get('/staff/team', {
                headers: { 'x-tenant-id': selectedBranch }
            });
            setStaffList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Fetch staff error:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/crm/leads', {
                params: { branchId: selectedBranch }
            });
            setLeads(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Fetch leads error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            // Check if branch is selected ONLY for New Leads
            if (!isEdit && selectedBranch === 'all') {
                toast.error('Please select a specific branch before adding a lead.');
                return;
            }

            const payload = {
                ...formData
            };

            // Only add branchId to payload if we are creating a new lead or have a specific branch selected
            if (!isEdit || (selectedBranch !== 'all')) {
                payload.branchId = selectedBranch;
            }

            if (isEdit && selectedLeadId) {
                await apiClient.patch(`/crm/leads/${selectedLeadId}`, payload);
                toast.success('Lead updated successfully');
            } else {
                await apiClient.post('/crm/leads', payload);
                toast.success('Lead added successfully');
            }
            setShowAddDrawer(false);
            setFormData({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New' });
            fetchLeads();
        } catch (error) {
            console.error('Save lead error:', error);
            toast.error(error.response?.data?.message || 'Failed to save lead');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) {
            setActiveMenu(null);
            return;
        }
        setActiveMenu(null);
        try {
            await apiClient.delete(`/crm/leads/${id}`);
            fetchLeads();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete lead: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleStatusUpdate = async (id, status, extraData = {}) => {
        try {
            setSubmitting(true);
            await apiClient.patch(`/crm/leads/${id}/status`, { status, ...extraData });
            fetchLeads();
            setActiveMenu(null);
            setShowLostModal(false);
            setShowConvertModal(false);
            toast.success(`Lead status updated to ${status}`);
        } catch (error) {
            console.error('Status update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDrawer = (lead) => {
        setFormData({
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            source: lead.source || 'Walk-in',
            notes: lead.notes || '',
            status: lead.status,
            assignedTo: lead.assignedToId || ''
        });
        setSelectedLeadId(lead.id);
        setIsEdit(true);
        setShowAddDrawer(true);
        setActiveMenu(null);
    };

    const openAddDrawer = () => {
        setFormData({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New', assignedTo: '' });
        setIsEdit(false);
        setShowAddDrawer(true);
        setDuplicateWarning(null);
    };

    const handleDuplicateCheck = async (field, value) => {
        if (!value || value.length < 5) return;
        try {
            const response = await apiClient.post('/crm/leads/check-duplicate', { [field]: value, branchId: selectedBranch });
            if (response.data.isDuplicate) {
                setDuplicateWarning({
                    field,
                    lead: response.data.existingLead
                });
            } else if (duplicateWarning?.field === field) {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error('Duplicate check error:', error);
        }
    };

    const toggleMenu = (e, leadId) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const menuWidth = 224; // w-56
        const menuHeight = 320; // approximate height

        let top = rect.bottom + 8;
        let left = rect.right - menuWidth;

        // If menu would go off bottom of screen, show it above the button
        if (top + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight - 8;
        }

        setMenuPosition({ top, left });
        setActiveMenu(activeMenu === leadId ? null : leadId);
    };

    const fetchLeadHistory = async (leadId) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/crm/leads/${leadId}`);
            setLeadHistory(response.data);
            setShowHistoryDrawer(true);
            setActiveMenu(null);
        } catch (error) {
            console.error('History fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogContact = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const nextFollowUp = logData.nextDate ? `${logData.nextDate}T${logData.nextTime || '10:00'}:00` : null;
            await apiClient.post(`/crm/leads/${selectedLeadId}/followups`, {
                notes: logData.notes,
                nextDate: nextFollowUp,
                status: logData.status
            });
            setShowLogDrawer(false);
            setLogData({ notes: '', nextDate: '', nextTime: '', status: '' });
            fetchLeads();
        } catch (error) {
            console.error('Log contact error:', error);
            toast.error('Failed to log contact');
        } finally {
            setSubmitting(false);
        }
    };

    const openLogDrawer = (lead) => {
        setSelectedLeadId(lead.id);
        setLogData({ ...logData, status: lead.status });
        setShowLogDrawer(true);
        setActiveMenu(null);
    };

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'New').length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        interested: leads.filter(l => l.status === 'Interested').length,
        converted: leads.filter(l => l.status === 'Converted').length,
        lost: leads.filter(l => l.status === 'Lost').length
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    const sourceStats = [
        { name: 'Walk-in', icon: Users, color: 'violet', count: leads.filter(l => l.source === 'Walk-in').length },
        { name: 'Online', icon: Search, color: 'blue', count: leads.filter(l => l.source === 'Online').length },
        { name: 'Referral', icon: Mail, color: 'emerald', count: leads.filter(l => l.source === 'Referral').length },
        { name: 'Social Media', icon: TrendingUp, color: 'pink', count: leads.filter(l => l.source === 'Social Media').length },
    ];

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn text-sans">
            {/* Header Section */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-transform duration-300 shrink-0">
                            <Users size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                Lead Management
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">Track and convert your fitness prospects</p>
                        </div>
                    </div>
                    <Button
                        onClick={openAddDrawer}
                        variant="primary"
                        className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        icon={UserPlus}
                    >
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[
                    { title: "Total Leads", value: stats.total, icon: Users, color: "from-primary to-primary" },
                    { title: "New", value: stats.new, icon: UserPlus, color: "from-indigo-500 to-blue-600" },
                    { title: "Contacted", value: stats.contacted, icon: Phone, color: "from-amber-400 to-orange-500" },
                    { title: "Interested", value: stats.interested, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
                    { title: "Converted", value: stats.converted, icon: CheckCircle, color: "from-blue-500 to-indigo-600" },
                    { title: "Lost", value: stats.lost, icon: X, color: "from-rose-500 to-red-600" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between h-full group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                        <div className="flex items-start justify-between w-full">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{item.title}</p>
                                <h3 className="text-3xl font-black text-slate-900">{item.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                                <item.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lead Sources Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none">Lead Sources</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Where your prospects are coming from</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : leads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sourceStats.map((source) => {
                                const percentage = leads.length > 0 ? Math.round((source.count / leads.length) * 100) : 0;
                                return (
                                    <div key={source.name} className="p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all bg-white group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-xl bg-${source.color}-50 text-${source.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <source.icon size={20} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-slate-900">{source.count}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Leads</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                                                <span>{source.name}</span>
                                                <span>{percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-${source.color}-500 rounded-full transition-all duration-1000`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Search size={40} className="text-slate-200 mb-2" />
                            <p className="text-xs font-bold uppercase">No leads to display</p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Leads Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none">All Leads</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manage your entire lead database</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-12 pr-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-white"
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper border-0 rounded-none overflow-x-auto">
                    <table className="saas-table saas-table-responsive w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Next Follow-up</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900" data-label="Name">{lead.name}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm" data-label="Contact">
                                            <div className="flex flex-col">
                                                <span>{lead.phone}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{lead.email || 'No email'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${lead.status === 'New' ? 'bg-primary-light text-primary' :
                                                    lead.status === 'Converted' ? 'bg-green-50 text-green-600' :
                                                        lead.status === 'Contacted' ? 'bg-orange-50 text-orange-600' :
                                                            lead.status === 'Interested' ? 'bg-emerald-50 text-emerald-600' :
                                                                lead.status === 'Lost' ? 'bg-rose-50 text-rose-600' :
                                                                    'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                                {lead.lostReason && (
                                                    <span className="text-[9px] text-slate-400 font-bold italic">Reason: {lead.lostReason}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-bold uppercase tracking-widest text-[10px]" data-label="Source">{lead.source}</td>
                                        <td className="px-6 py-4 text-slate-500 text-[10px] font-bold" data-label="Created">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4" data-label="Follow-up">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'No date'}</span>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                                    {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Time not set'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Assigned To">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                    {lead.assignedTo?.name ? lead.assignedTo.name[0].toUpperCase() : '?'}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{lead.assignedTo?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={(e) => toggleMenu(e, lead.id)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${activeMenu === lead.id
                                                        ? 'bg-primary text-white shadow-xl shadow-violet-200 rotate-90 scale-110'
                                                        : 'text-slate-400 hover:text-primary hover:bg-primary-light'
                                                        }`}
                                                >
                                                    <MoreHorizontal size={22} />
                                                </button>

                                                {activeMenu === lead.id && (
                                                    <div
                                                        className="fixed w-56 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] p-2 animate-scaleIn origin-top-right"
                                                        style={{
                                                            top: menuPosition.top,
                                                            left: menuPosition.left
                                                        }}
                                                    >
                                                        {/* Header */}
                                                        <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 rounded-2xl">
                                                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                                                                <Users size={14} />
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Manage</span>
                                                                <span className="text-xs font-black text-slate-800"> Prospect</span>
                                                            </div>
                                                        </div>

                                                        {/* Backdrop for closing */}
                                                        <div
                                                            className="fixed inset-0 z-[-1]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenu(null);
                                                            }}
                                                        />

                                                        {/* Main Actions */}
                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => openEditDrawer(lead)}
                                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all group"
                                                            >
                                                                <Edit3 size={14} className="text-slate-400 group-hover:text-primary" />
                                                                Edit Profile
                                                            </button>

                                                            <button
                                                                onClick={() => openLogDrawer(lead)}
                                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all group"
                                                            >
                                                                <Phone size={14} className="text-slate-400 group-hover:text-primary" />
                                                                Log Contact
                                                            </button>

                                                            <button
                                                                onClick={() => fetchLeadHistory(lead.id)}
                                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all group"
                                                            >
                                                                <TrendingUp size={14} className="text-slate-400 group-hover:text-primary" />
                                                                View Profile
                                                            </button>

                                                            <div className="h-px bg-slate-100 mx-2 my-1"></div>

                                                            <div className="px-3 py-2">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Status</span>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {[
                                                                        { label: 'Contacted', color: 'orange', icon: Phone },
                                                                        { label: 'Interested', color: 'emerald', icon: TrendingUp },
                                                                        { label: 'Converted', color: 'blue', icon: CheckCircle },
                                                                        { label: 'Lost', color: 'rose', icon: X }
                                                                    ].filter(s => s.label !== lead.status).map((s) => (
                                                                        <button
                                                                            key={s.label}
                                                                            onClick={() => {
                                                                                if (s.label === 'Lost') {
                                                                                    setSelectedLeadId(lead.id);
                                                                                    setShowLostModal(true);
                                                                                    setActiveMenu(null);
                                                                                } else if (s.label === 'Converted') {
                                                                                    setSelectedLeadId(lead.id);
                                                                                    setLeadHistory(lead); // Use for modal info
                                                                                    setShowConvertModal(true);
                                                                                    setActiveMenu(null);
                                                                                } else {
                                                                                    handleStatusUpdate(lead.id, s.label);
                                                                                }
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-3 py-2 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                                                                        >
                                                                            <s.icon size={12} />
                                                                            {s.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="h-px bg-slate-100 mx-2 my-1"></div>

                                                            <button
                                                                onClick={() => handleDeleteLead(lead.id)}
                                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group"
                                                            >
                                                                <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                                                Delete Lead
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                <Users size={40} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight">No leads found</h3>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Start growing your gym by adding your first lead</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Lead Drawer */}
            <RightDrawer
                isOpen={showAddDrawer}
                onClose={() => setShowAddDrawer(false)}
                title={isEdit ? "Edit Lead" : "Add New Lead"}
                subtitle={isEdit ? "Update lead information" : "Create a new lead for follow-up"}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddDrawer(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                            onClick={handleAddLead}
                            icon={isEdit ? Edit3 : UserPlus}
                        >
                            {isEdit ? 'Update Lead' : 'Add Lead'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div className="space-y-6">
                        <div className="saas-form-group">
                            <label className="saas-label">Full Name *</label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                className="saas-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Phone *</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                className="saas-input"
                                value={formData.phone}
                                onBlur={(e) => handleDuplicateCheck('phone', e.target.value)}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            {duplicateWarning?.field === 'phone' && (
                                <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 items-start animate-fadeIn">
                                    <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                    <p className="text-[10px] font-bold text-amber-700">
                                        This phone is already registered to {duplicateWarning.lead.name} ({duplicateWarning.lead.status})
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Email</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="saas-input"
                                value={formData.email}
                                onBlur={(e) => handleDuplicateCheck('email', e.target.value)}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {duplicateWarning?.field === 'email' && (
                                <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 items-start animate-fadeIn">
                                    <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                    <p className="text-[10px] font-bold text-amber-700">
                                        This email is already registered to {duplicateWarning.lead.name} ({duplicateWarning.lead.status})
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Assign To Staff</label>
                            <select
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                className="saas-input"
                            >
                                <option value="">Select Staff member</option>
                                {staffList.filter(s => s.role === 'STAFF').map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Source</label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="saas-input appearance-none cursor-pointer"
                            >
                                <option value="Walk-in">Walk-in</option>
                                <option value="Online">Online</option>
                                <option value="Referral">Referral</option>
                                <option value="Social Media">Social Media</option>
                            </select>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Notes</label>
                            <textarea
                                placeholder="Any additional notes..."
                                rows={4}
                                className="saas-input resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </RightDrawer>

            {/* Log Contact Drawer */}
            {/* Log Contact Drawer */}
            <RightDrawer
                isOpen={showLogDrawer}
                onClose={() => setShowLogDrawer(false)}
                title="Log Contact"
                subtitle="Record call/meeting notes and schedule next follow-up"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLogDrawer(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                            onClick={handleLogContact}
                        >
                            Save Log
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="saas-form-group">
                        <label className="saas-label">What happened? (Notes)</label>
                        <textarea
                            placeholder="Customer is interested, asked for a trial session..."
                            rows={4}
                            value={logData.notes}
                            onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                            className="saas-input resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="saas-form-group">
                            <label className="saas-label">Next Follow-up Date</label>
                            <input
                                type="date"
                                value={logData.nextDate}
                                onChange={(e) => setLogData({ ...logData, nextDate: e.target.value })}
                                className="saas-input"
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Time</label>
                            <input
                                type="time"
                                value={logData.nextTime}
                                onChange={(e) => setLogData({ ...logData, nextTime: e.target.value })}
                                className="saas-input"
                            />
                        </div>
                    </div>
                    <div className="saas-form-group">
                        <label className="saas-label">Update Status</label>
                        <select
                            value={logData.status}
                            onChange={(e) => setLogData({ ...logData, status: e.target.value })}
                            className="saas-input"
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>
                </div>
            </RightDrawer>

            {/* History Drawer */}
            <RightDrawer
                isOpen={showHistoryDrawer}
                onClose={() => setShowHistoryDrawer(false)}
                title="Lead History"
                subtitle={`Timeline for ${leadHistory?.name}`}
                maxWidth="max-w-lg"
            >
                <div className="">
                    {leadHistory?.followUps?.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-100 mt-2">
                            {leadHistory.followUps.map((log, idx) => (
                                <div key={log.id} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-4 border-primary shadow-sm z-10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Contact Logged</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">"{log.notes}"</p>
                                        {log.nextDate && (
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Scheduled Next: {new Date(log.nextDate).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No history logs found</p>
                        </div>
                    )}
                </div>
            </RightDrawer>

            {/* Status Modals */}
            <MarkAsLostModal 
                isOpen={showLostModal}
                onClose={() => setShowLostModal(false)}
                submitting={submitting}
                onConfirm={(reason) => handleStatusUpdate(selectedLeadId, 'Lost', { lostReason: reason })}
            />

            <ConvertLeadModal 
                isOpen={showConvertModal}
                onClose={() => setShowConvertModal(false)}
                submitting={submitting}
                lead={leadHistory}
                onConfirm={(data) => handleStatusUpdate(selectedLeadId, 'Converted', data)}
            />

        </div>
    );
};

export default LeadsPipeline;
