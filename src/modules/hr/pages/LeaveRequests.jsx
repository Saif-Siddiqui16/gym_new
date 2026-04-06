import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, User, FileText, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { fetchLeaveRequestsAPI, updateLeaveStatusAPI } from '../../../api/admin/adminApi';
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

const LeaveRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        setLoading(true);
        try { const data = await fetchLeaveRequestsAPI(); setRequests(data || []); }
        catch (error) { toast.error('Sync failed'); }
        finally { setLoading(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        setIsUpdating(true);
        try {
            await updateLeaveStatusAPI(id, status);
            toast.success(`Request ${status}!`);
            loadRequests();
        } catch (error) { toast.error('Failed to update'); }
        finally { setIsUpdating(false); }
    };

    const StatusBadge = ({ status }) => {
        let colors = { background: T.bg, color: T.muted };
        if (status === 'Approved') colors = { background: '#ECFDF5', color: T.success };
        if (status === 'Rejected') colors = { background: '#FEF2F2', color: T.error };
        if (status === 'Pending') colors = { background: '#FFFBEB', color: '#D97706' };
        return <span style={{ ...S.badge, ...colors }}>{status}</span>;
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: T.muted, fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase' }}><ArrowLeft size={14} /> Back</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Calendar size={32} /></div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Leave Management</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Review staff absence & PTO requests</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={S.card}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Applicant', 'Absence Type', 'Schedule', 'Reasoning', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '80px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color={T.accent} /></td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '100px' }}><div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><FileText size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No pending applications</p></div></td></tr>
                            ) : (
                                requests.map((leave, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                                                <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{leave.user?.name || 'Staff'}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>{leave.user?.role || 'Operator'}</p></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><span style={{ fontSize: '12px', fontWeight: '700', color: T.muted, background: T.bg, padding: '4px 10px', borderRadius: '8px' }}>{leave.type}</span></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '800', color: T.text }}>{new Date(leave.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                    {new Date(leave.startDate).getTime() !== new Date(leave.endDate).getTime() && <span style={{ fontSize: '10px', fontWeight: '600', color: T.muted }}>to {new Date(leave.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><p style={{ fontSize: '12px', fontWeight: '600', color: T.muted, margin: 0, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={leave.reason}>{leave.reason}</p></td>
                                        <td style={{ padding: '20px 24px' }}><StatusBadge status={leave.status} /></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {leave.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} disabled={isUpdating} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', border: 'none', color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CheckCircle2 size={18} /></button>
                                                    <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} disabled={isUpdating} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', border: 'none', color: T.error, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><XCircle size={18} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests;
