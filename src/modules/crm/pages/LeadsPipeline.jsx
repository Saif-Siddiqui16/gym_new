import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, TrendingUp, CheckCircle, Search, Filter, BarChart3, Mail, MoreHorizontal, Loader2, Trash2, Edit3, X } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import StatsCard from '../../../modules/dashboard/components/StatsCard';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';

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

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'Walk-in',
        notes: '',
        status: 'New'
    });

    useEffect(() => {
        fetchLeads();
    }, [selectedBranch]);

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
                alert('Please select a specific branch before adding a lead.');
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
            } else {
                await apiClient.post('/crm/leads', payload);
            }
            setShowAddDrawer(false);
            setFormData({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New' });
            fetchLeads();
        } catch (error) {
            console.error('Save lead error:', error);
            alert(error.response?.data?.message || 'Failed to save lead');
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
            alert('Failed to delete lead: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await apiClient.patch(`/crm/leads/${id}/status`, { status });
            fetchLeads();
            setActiveMenu(null);
        } catch (error) {
            console.error('Status update error:', error);
        }
    };

    const openEditDrawer = (lead) => {
        setFormData({
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            source: lead.source || 'Walk-in',
            notes: lead.notes || '',
            status: lead.status
        });
        setSelectedLeadId(lead.id);
        setIsEdit(true);
        setShowAddDrawer(true);
        setActiveMenu(null);
    };

    const openAddDrawer = () => {
        setFormData({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New' });
        setIsEdit(false);
        setShowAddDrawer(true);
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

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'New').length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        interested: leads.filter(l => l.status === 'Interested').length,
        converted: leads.filter(l => l.status === 'Converted').length
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-0 md:p-8 space-y-6 sm:space-y-8 animate-fadeIn">

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-200 shrink-0">
                                <Users size={24} className="sm:w-8 sm:h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Lead Management</h1>
                                <p className="text-slate-500 font-bold text-[10px] sm:text-sm uppercase tracking-widest mt-1">
                                    Track and convert your fitness prospects
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openAddDrawer}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 !text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:scale-105 transition-all"
                        >
                            <UserPlus size={18} className="!text-white" />
                            <span className="!text-white">Add Lead</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatsCard title="Total Leads" value={stats.total.toString()} icon={Users} color="primary" isEarningsLayout={true} />
                <StatsCard title="New" value={stats.new.toString()} icon={UserPlus} color="info" isEarningsLayout={true} />
                <StatsCard title="Contacted" value={stats.contacted.toString()} icon={Phone} color="warning" isEarningsLayout={true} />
                <StatsCard title="Interested" value={stats.interested.toString()} icon={TrendingUp} color="success" isEarningsLayout={true} />
                <StatsCard title="Converted" value={stats.converted.toString()} icon={CheckCircle} color="secondary" isEarningsLayout={true} />
            </div>

            {/* Lead Sources Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-4 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Lead Sources</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Where your prospects are coming from</p>
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                    </div>
                ) : leads.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sourceStats.map((source) => {
                            const percentage = leads.length > 0 ? Math.round((source.count / leads.length) * 100) : 0;
                            return (
                                <div key={source.name} className="relative group p-6 rounded-3xl border border-slate-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-50 transition-all duration-300 bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-${source.color}-50 text-${source.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <source.icon size={24} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-slate-900 leading-none">{source.count}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Leads</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>{source.name}</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-${source.color}-500 rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-200 mx-auto mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No leads to display</p>
                        </div>
                    </div>
                )}
            </div>

            {/* All Leads Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">All Leads</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Manage your entire lead database</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-white"
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper border-0 rounded-none">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Follow-up</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-bold text-slate-900" data-label="Name">{lead.name}</td>
                                        <td className="px-8 py-4 text-slate-600 text-sm" data-label="Contact">
                                            <div className="flex flex-col">
                                                <span>{lead.phone}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{lead.email || 'No email'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4" data-label="Status">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${lead.status === 'New' ? 'bg-blue-50 text-blue-600' :
                                                    lead.status === 'Converted' ? 'bg-green-50 text-green-600' :
                                                        lead.status === 'Contacted' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-slate-600 text-sm font-bold uppercase tracking-widest text-[10px]" data-label="Source">{lead.source}</td>
                                        <td className="px-8 py-4 text-slate-500 text-[10px] font-bold" data-label="Created">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4" data-label="Follow-up">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'No date'}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{lead.followUpTime || 'Time not set'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right" data-label="Actions">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={(e) => setActiveMenu(activeMenu === lead.id ? null : lead.id)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${activeMenu === lead.id
                                                        ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 rotate-90 scale-110'
                                                        : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'
                                                        }`}
                                                >
                                                    <MoreHorizontal size={22} />
                                                </button>

                                                {activeMenu === lead.id && (
                                                    <div className="absolute right-full mr-2 top-0 w-56 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] p-2 animate-scaleIn origin-right">
                                                        {/* Header */}
                                                        <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 rounded-2xl">
                                                            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
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
                                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all group"
                                                            >
                                                                <Edit3 size={14} className="text-slate-400 group-hover:text-violet-500" />
                                                                Edit Profile
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
                                                                            onClick={() => handleStatusUpdate(lead.id, s.label)}
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
                        <button
                            onClick={() => setShowAddDrawer(false)}
                            className="px-6 h-11 border-2 border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all font-sans"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={submitting}
                            onClick={handleAddLead}
                            className="px-6 h-11 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:scale-105 transition-all font-sans disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Lead' : 'Add Lead')}
                        </button>
                    </div>
                }
            >
                <div className="p-8 space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone *</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Source</label>
                            <div className="relative">
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                >
                                    <option value="Walk-in">Walk-in</option>
                                    <option value="Online">Online</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Social Media">Social Media</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <Filter size={14} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Notes</label>
                            <textarea
                                placeholder="Any additional notes..."
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </RightDrawer>

        </div>
    );
};

export default LeadsPipeline;
