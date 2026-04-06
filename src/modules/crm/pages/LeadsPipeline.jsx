import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Phone, TrendingUp, CheckCircle, Search, Filter, BarChart3, Mail, MoreHorizontal, Trash2, Edit3, X, AlertCircle, ArrowLeft, Calendar, User, Layout, MessageSquare, ChevronRight, FileText } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New', assignedTo: '' });
    const [staffList, setStaffList] = useState([]);

    useEffect(() => { fetchLeads(); fetchStaff(); }, [selectedBranch]);

    const fetchStaff = async () => { try { const r = await apiClient.get('/staff/team', { headers: { 'x-tenant-id': selectedBranch } }); setStaffList(Array.isArray(r.data) ? r.data : []); } catch { } };
    const fetchLeads = async () => {
        try { setLoading(true); const r = await apiClient.get('/crm/leads', { params: { branchId: selectedBranch } }); setLeads(Array.isArray(r.data) ? r.data : []); }
        catch { } finally { setLoading(false); }
    };

    const handleSaveLead = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.phone) return toast.error('Name and Phone required');
            const payload = { ...formData, branchId: selectedBranch };
            if (isEdit) await apiClient.patch(`/crm/leads/${selectedLeadId}`, payload);
            else await apiClient.post('/crm/leads', payload);
            toast.success(isEdit ? 'Lead updated' : 'Lead added');
            setShowAddDrawer(false);
            fetchLeads();
        } catch (error) { toast.error('Failed to save'); }
    };

    const StatusBadge = ({ status }) => {
        let colors = { background: '#F0F0FF', color: T.accent };
        if (status === 'Converted') colors = { background: '#ECFDF5', color: T.success };
        if (status === 'Lost') colors = { background: '#FEF2F2', color: T.error };
        if (status === 'Interested') colors = { background: '#EEF2FF', color: '#6366F1' };
        if (status === 'Contacted') colors = { background: '#FFFBEB', color: '#D97706' };
        return <span style={{ ...S.badge, ...colors }}>{status}</span>;
    };

    const stats = [
        { label: 'Pipeline', val: leads.length, icon: Layout, bg: T.accent },
        { label: 'Raw Leads', val: leads.filter(l => l.status === 'New').length, icon: UserPlus, bg: '#6366F1' },
        { label: 'Contacted', val: leads.filter(l => l.status === 'Contacted').length, icon: Phone, bg: '#D97706' },
        { label: 'Interested', val: leads.filter(l => l.status === 'Interested').length, icon: TrendingUp, bg: T.success },
        { label: 'Closed', val: leads.filter(l => l.status === 'Converted').length, icon: CheckCircle, bg: '#2563EB' },
        { label: 'Lost', val: leads.filter(l => l.status === 'Lost').length, icon: AlertCircle, bg: T.error }
    ];

    const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm));

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                     <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Leads Pipeline</h1>
                     <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Convert prospects into active gym members</p>
                </div>
                <button onClick={() => { setIsEdit(false); setFormData({ name: '', phone: '', email: '', source: 'Walk-in', notes: '', status: 'New', assignedTo: '' }); setShowAddDrawer(true); }} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '48px', padding: '0 24px', borderRadius: '14px' }}><UserPlus size={18} /> New Lead</button>
            </div>

            {/* Metrics removed for original layout */}

            <div style={S.card}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input placeholder="Search prospect name/phone..." style={{ ...S.input, paddingLeft: '44px', width: '100%', fontSize: '13px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Prospect', 'Source', 'Status', 'Follow-up', 'Assigned To', 'Actions'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '80px 0' }}><Loader message="Fetching leads pipeline..." /></td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '100px', textAlign: 'center' }}><div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px' }}>Pipeline is empty</p></div></td></tr>
                            ) : (
                                filteredLeads.map((lead, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                                                <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{lead.name}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{lead.phone}</p></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, background: T.bg, padding: '4px 10px', borderRadius: '6px' }}>{lead.source}</span></td>
                                        <td style={{ padding: '16px 24px' }}><StatusBadge status={lead.status} /></td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {lead.nextFollowUp ? (
                                                <div><p style={{ fontSize: '12px', fontWeight: '800', color: T.text, margin: 0 }}>{new Date(lead.nextFollowUp).toLocaleDateString()}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>{new Date(lead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                                            ) : <span style={{ fontSize: '11px', color: T.subtle }}>No schedule</span>}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: T.accent }}>{lead.assignedTo?.name?.[0] || '?'}</div>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: T.text }}>{lead.assignedTo?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                             <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => { setSelectedLeadId(lead.id); setFormData({ ...lead, assignedTo: lead.assignedToId || '' }); setIsEdit(true); setShowAddDrawer(true); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, border: 'none', color: T.accent, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer' }}><Edit3 size={16} style={{ display: 'block' }} /></button>
                                                <button onClick={() => { if(window.confirm('Delete Lead?')) apiClient.delete(`/crm/leads/${lead.id}`).then(fetchLeads); }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', border: 'none', color: T.error, display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer' }}><Trash2 size={16} style={{ display: 'block' }} /></button>
                                             </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddDrawer && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(26, 21, 51, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
                    <div style={{ width: '450px', background: '#FFF', height: '100%', padding: '40px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{isEdit ? 'Update Lead' : 'Add New Lead'}</h2><p style={{ fontSize: '13px', color: T.muted, margin: '4px 0 0' }}>{isEdit ? 'Modify lead details' : 'Add prospect to your pipeline'}</p></div>
                            <button onClick={() => setShowAddDrawer(false)} style={{ background: T.bg, border: 'none', width: '36px', height: '36px', borderRadius: '12px', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Prospect Name *</label><input style={{ ...S.input, width: '100%' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contact Phone *</label><input style={{ ...S.input, width: '100%' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label><input style={{ ...S.input, width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Lead Source</label><select style={{ ...S.input, width: '100%' }} value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}><option value="Walk-in">Walk-in</option><option value="Online">Online</option><option value="Referral">Referral</option><option value="Social Media">Social Media</option></select></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Assign to Staff</label><select style={{ ...S.input, width: '100%' }} value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}><option value="">Select Staff</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Requirement Notes</label><textarea style={{ ...S.input, width: '100%', height: '100px', padding: '12px', resize: 'none' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowAddDrawer(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.text }}>Discard</button>
                            <button onClick={handleSaveLead} style={{ ...S.btn, flex: 1, background: T.accent, color: '#FFF' }}>{isEdit ? 'Save Changes' : 'Save Lead'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPipeline;
