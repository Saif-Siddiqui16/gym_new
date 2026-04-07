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
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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

    const handleDeleteLead = (id) => {
        setActiveMenu(null);
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDeleteLead = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await apiClient.delete(`/crm/leads/${confirmModal.id}`);
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchLeads();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete lead: ' + (error.response?.data?.message || error.message));
            setConfirmModal(prev => ({ ...prev, loading: false }));
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
        <div style={{ background: T.bg, minHeight: '100vh', padding: '32px', fontFamily: S.ff }}>
             <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                     <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Leads Pipeline</h1>
                     <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Track and convert your fitness prospects with intelligence</p>
                </div>
                <button onClick={openAddDrawer} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '48px', padding: '0 24px', borderRadius: '14px' }}><UserPlus size={18} /> New Lead</button>
            </div>

            {/* Stats Cards Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                    { title: "Total Leads", value: stats.total, icon: Users, color: T.accent },
                    { title: "New", value: stats.new, icon: UserPlus, color: "#6366F1" },
                    { title: "Contacted", value: stats.contacted, icon: Phone, color: "#D97706" },
                    { title: "Interested", value: stats.interested, icon: TrendingUp, color: T.success },
                    { title: "Converted", value: stats.converted, icon: CheckCircle, color: "#2563EB" },
                    { title: "Lost", value: stats.lost, icon: X, color: T.error }
                ].map((item, idx) => (
                    <div key={idx} style={{ ...S.card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${item.color}10`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <item.icon size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>{item.title}</p>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: 0 }}>{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="saas-card !p-0 overflow-hidden" style={{ marginBottom: '24px' }}>
                <div className="p-5 border-b border-border-light flex items-center justify-between gap-4">
                    <div className="section-title mb-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-title leading-none">Lead Sources</h2>
                            <p className="page-subtitle text-[10px] mt-1">Where your prospects are coming from</p>
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
            <div style={{ ...S.card, marginBottom: '32px' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>Leads Pipeline</h2>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Manage your entire lead database</p>
                    </div>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ ...S.input, paddingLeft: '44px', width: '100%', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Prospect', 'Contact Info', 'Status', 'Follow-up', 'Assigned To', 'Actions'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '80px 0' }}><div style={{ display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.accent} /></div></td></tr>
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => {
                                    const StatusColor = {
                                        'New': { bg: T.accentLight, text: T.accent },
                                        'Contacted': { bg: '#FFFBEB', text: '#D97706' },
                                        'Interested': { bg: '#EEF2FF', text: '#6366F1' },
                                        'Converted': { bg: '#ECFDF5', text: T.success },
                                        'Lost': { bg: '#FEF2F2', text: T.error }
                                    }[lead.status] || { bg: T.bg, text: T.muted };

                                    return (
                                        <tr key={lead.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{lead.name[0]}</div>
                                                    <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{lead.name}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.subtle, margin: 0 }}>{lead.source}</p></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: T.text }}>{lead.phone}</span>
                                                    <span style={{ fontSize: '11px', color: T.muted }}>{lead.email || 'No email'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ ...S.badge, background: StatusColor.bg, color: StatusColor.text }}>{lead.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {lead.nextFollowUp ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: T.text }}>{new Date(lead.nextFollowUp).toLocaleDateString()}</span>
                                                        <span style={{ fontSize: '10px', color: T.muted, fontWeight: '700' }}>{new Date(lead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                ) : <span style={{ fontSize: '12px', color: T.subtle }}>-</span>}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: T.accent }}>{lead.assignedTo?.name?.[0] || '?'}</div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: T.text }}>{lead.assignedTo?.name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <button
                                                        onClick={(e) => toggleMenu(e, lead.id)}
                                                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: activeMenu === lead.id ? T.accent : T.bg, border: 'none', color: activeMenu === lead.id ? '#FFF' : T.muted, display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </button>
    
                                                    {activeMenu === lead.id && (
                                                        <div
                                                            style={{
                                                                position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: '200px', background: '#FFF', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: `1px solid ${T.border}`, padding: '8px', zIndex: 9999, pointerEvents: 'auto', textAlign: 'left'
                                                            }}
                                                        >
                                                            <div style={{ padding: '8px 12px', background: T.bg, borderRadius: '12px', marginBottom: '8px' }}>
                                                                <p style={{ fontSize: '11px', fontWeight: '800', color: T.text, margin: 0 }}>Options</p>
                                                            </div>
                                                            <button onClick={() => openEditDrawer(lead)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={14} color={T.subtle} /> Edit Profile</button>
                                                            <button onClick={() => openLogDrawer(lead)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color={T.subtle} /> Log Contact</button>
                                                            <button onClick={() => fetchLeadHistory(lead.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={14} color={T.subtle} /> View History</button>
                                                            
                                                            <div style={{ padding: '8px 12px', borderTop: `1px solid ${T.border}`, marginTop: '8px' }}>
                                                                <p style={{ fontSize: '9px', fontWeight: '900', color: T.subtle, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Update Status</p>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                                                                    {[
                                                                        { label: 'Contacted', color: '#D97706', bg: '#FFFBEB', icon: Phone },
                                                                        { label: 'Interested', color: '#6366F1', bg: '#EEF2FF', icon: TrendingUp },
                                                                        { label: 'Converted', color: T.success, bg: '#ECFDF5', icon: CheckCircle },
                                                                        { label: 'Lost', color: T.error, bg: '#FEF2F2', icon: X }
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
                                                                                    setLeadHistory(lead);
                                                                                    setShowConvertModal(true);
                                                                                    setActiveMenu(null);
                                                                                } else {
                                                                                    handleStatusUpdate(lead.id, s.label);
                                                                                }
                                                                            }}
                                                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: 'none', background: s.bg, color: s.color, fontSize: '10px', fontWeight: '800', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}
                                                                        >
                                                                            <s.icon size={12} /> {s.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div style={{ height: '1px', background: T.border, margin: '4px 0' }}></div>
                                                            <button onClick={() => handleDeleteLead(lead.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: T.error, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={14} /> Delete Lead</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '80px 0', textAlign: 'center' }}><p style={{ fontSize: '14px', fontWeight: '700', color: T.subtle }}>No leads found</p></td></tr>
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
                maxWidth="500px"
                footer={
                    <div className="flex gap-3 w-full justify-end" style={{ padding: '20px', borderTop: `1px solid ${T.border}`, background: T.bg }}>
                        <button onClick={() => setShowAddDrawer(false)} style={{ ...S.btn, background: '#FFF', color: T.text, border: `2px solid ${T.border}` }}>Cancel</button>
                        <button onClick={handleAddLead} disabled={submitting} style={{ ...S.btn, background: T.accent, color: '#FFF' }}>{submitting ? 'Processing...' : (isEdit ? 'Update Lead' : 'Add Lead')}</button>
                    </div>
                }
            >
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name *</label><input placeholder="Enter Lead Name" style={{ ...S.input, width: '100%' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Phone Number *</label><input placeholder="+91 00000 00000" style={{ ...S.input, width: '100%' }} value={formData.phone} onBlur={e => handleDuplicateCheck('phone', e.target.value)} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label><input placeholder="email@example.com" style={{ ...S.input, width: '100%' }} value={formData.email} onBlur={e => handleDuplicateCheck('email', e.target.value)} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Lead Status</label><select style={{ ...S.input, width: '100%' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option><option value="Lost">Lost</option></select></div>
                        <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Lead Source</label><select style={{ ...S.input, width: '100%' }} value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}><option value="Walk-in">Walk-in</option><option value="Online">Online</option><option value="Referral">Referral</option><option value="Social Media">Social Media</option></select></div>
                    </div>

                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Assign To Staff</label><select value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} style={{ ...S.input, width: '100%' }}><option value="">Select Staff</option>{staffList.filter(s => s.role === 'STAFF').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Notes & Requirements</label><textarea placeholder="Add any specific requirements..." rows={4} style={{ ...S.input, width: '100%', height: 'auto', padding: '12px' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                </div>
            </RightDrawer>

            {/* Log Contact Drawer */}
            {/* Log Contact Drawer */}
            <RightDrawer
                isOpen={showLogDrawer}
                onClose={() => setShowLogDrawer(false)}
                title="Log Contact"
                subtitle="Record interaction and schedule next step"
                maxWidth="500px"
                footer={
                    <div className="flex gap-3 w-full justify-end" style={{ padding: '20px', borderTop: `1px solid ${T.border}`, background: T.bg }}>
                        <button onClick={() => setShowLogDrawer(false)} style={{ ...S.btn, background: '#FFF', color: T.text, border: `2px solid ${T.border}` }}>Cancel</button>
                        <button onClick={handleLogContact} disabled={submitting} style={{ ...S.btn, background: T.accent, color: '#FFF' }}>{submitting ? 'Saving...' : 'Save Log'}</button>
                    </div>
                }
            >
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Interaction Notes</label><textarea placeholder="Prospect interested in morning batches, asked for trial..." rows={4} style={{ ...S.input, width: '100%', height: 'auto', padding: '12px' }} value={logData.notes} onChange={e => setLogData({ ...logData, notes: e.target.value })} /></div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Follow-up Date</label><input type="date" style={{ ...S.input, width: '100%' }} value={logData.nextDate} onChange={e => setLogData({ ...logData, nextDate: e.target.value })} /></div>
                        <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Time</label><input type="time" style={{ ...S.input, width: '100%' }} value={logData.nextTime} onChange={e => setLogData({ ...logData, nextTime: e.target.value })} /></div>
                    </div>

                    <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Update Status</label><select style={{ ...S.input, width: '100%' }} value={logData.status} onChange={e => setLogData({ ...logData, status: e.target.value })}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option><option value="Lost">Lost</option></select></div>
                </div>
            </RightDrawer>

            {/* History Drawer */}
            <RightDrawer
                isOpen={showHistoryDrawer}
                onClose={() => setShowHistoryDrawer(false)}
                title="Lead History"
                subtitle={`Timeline for ${leadHistory?.name}`}
                maxWidth="600px"
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDeleteLead}
                title="Delete Lead?"
                message="This lead and all associated data will be permanently removed."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />

        </div>
    );
};

export default LeadsPipeline;
