import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Ban, AlertCircle, Phone, Building2, MapPin, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { fetchAllGyms, toggleGymStatus } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        // primary purple
  accent2: '#9B7BFF',       // lighter purple
  accentLight: '#F0ECFF',   // purple tint bg
  accentMid: '#E4DCFF',     // purple border/focus
  border: '#EAE7FF',        // default borders
  bg: '#F6F5FF',            // page background
  surface: '#FFFFFF',       // card/input surface
  text: '#1A1533',          // primary text
  muted: '#7B7A8E',         // secondary text
  subtle: '#B0ADCC',        // subtle icons/placeholders
  green: '#22C97A',         // healthy status
  greenLight: '#E8FBF2',
  rose: '#F43F5E',          // error/danger
  roseLight: '#FFF1F4',
  amber: '#F59E0B',         // warning/pending
  amberLight: '#FEF3C7',
};

const SuspendedGyms = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    useEffect(() => {
        const timer = setTimeout(() => { loadSuspendedGyms(); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadSuspendedGyms = async () => {
        setLoading(true);
        try {
            const data = await fetchAllGyms({ search: searchTerm, status: 'Suspended', limit: 100 });
            setGyms(data.gyms || []);
        } catch (error) { 
            console.error(error); 
            setGyms([]); 
        } finally { setLoading(false); }
    };

    const handleReactivate = (id) => setConfirmModal({ isOpen: true, id, loading: false });

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
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Loading suspended gyms…</p>
            </div>
        );
    }

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                
                .grid-table { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr 120px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; position: relative; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 4px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
                    .actions-cell { justify-content: flex-start !important; padding-top: 10px; border-top: 1px solid ${T.border}; }
                }
            `}</style>

            {/* ──────── HEADER BANNER ──────── */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 20, padding: '20px 26px', boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative'
            }} className="header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
                    }}>
                        <Ban size={26} color={T.rose} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Suspended Gyms</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontWeight: 500 }}>Management of suspended branches and status review</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(245,158,11,0.15)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertCircle size={18} color={T.amber} />
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#FEF3C7', margin: 0 }}>Restoring a gym will reactivate all its features and staff access.</p>
                </div>
            </div>

            {/* ──────── FILTER BAR ──────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 40, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={16} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search gym name, owner or phone…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
            </div>

            {/* ──────── TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    {/* Header */}
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Gym Details', 'Contact', 'Owner Name', 'Status', 'Actions'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 4 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {/* Content */}
                    {gyms.length > 0 ? gyms.map((gym, i) => (
                        <div key={gym.id} style={{ padding: '18px 22px', borderBottom: i < gyms.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, boxShadow: '0 4px 12px rgba(244,63,94,0.1)' }}>
                                    {(gym.gymName || '?').charAt(0)}
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Gym Detail</span>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{gym.gymName}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: T.muted, marginTop: 2 }}>
                                        <MapPin size={10} color={T.subtle} /> {gym.branchName}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Contact Info</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.muted }}>
                                    <Phone size={12} color={T.subtle} /> {gym.phone}
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Owner</span>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{gym.owner}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: T.roseLight, color: T.rose, border: `1px solid ${T.rose}20` }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.rose }} /> SUSPENDED
                                </span>
                            </div>

                            <div style={{ textAlign: 'center' }} className="actions-cell">
                                <span style={{ display: 'none' }} className="mobile-label">Reactivate</span>
                                <button
                                    onClick={() => handleReactivate(gym.id)}
                                    style={{
                                        padding: '8px 16px', borderRadius: 10, background: T.greenLight, color: T.green,
                                        fontSize: 11, fontWeight: 800, border: `1px solid ${T.green}30`, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s', margin: '0 auto'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
                                >
                                    <RotateCcw size={14} /> REACTIVATE
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Activity size={24} color={T.subtle} />
                            </div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>No suspended gyms found</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No gyms have been suspended yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processReactivate}
                title="Reactivate Gym?"
                message="This will reactivate the gym and restore access for its staff and members. Are you sure?"
                confirmText="Reactivate"
                type="success"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default SuspendedGyms;
