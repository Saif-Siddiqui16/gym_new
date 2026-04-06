import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, MapPin, DollarSign, History, Wallet, Building2, User, UserCheck, Activity } from 'lucide-react';
import WalletDrawer from './WalletDrawer';
import { ROLES } from '../config/roles';
import { fetchMemberWallets } from '../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const ActionBtn = ({ onClick, title, children }) => {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick} title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                height: 34, padding: '0 14px', borderRadius: 10, border: `1px solid ${T.border}`,
                background: T.accentLight, color: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer', transition: '0.2s', fontSize: 12, fontWeight: 800,
                transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? '0 4px 12px rgba(124,92,252,0.15)' : 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
        >
            {children}
        </button>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const WalletList = ({ role = ROLES.SUPER_ADMIN }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState([]);
    const [walletData, setWalletData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 8;

    useEffect(() => { loadWallets(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await fetchMemberWallets();
            setWallets(data || []);
            const walletMap = (data || []).reduce((acc, w) => {
                acc[w.id] = { balance: Number(w.balance) || 0, transactions: w.transactions || [], lastTransaction: w.lastTransaction || 'N/A' };
                return acc;
            }, {});
            setWalletData(walletMap);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleViewWallet = (member) => { setSelectedMember(member); setIsDrawerOpen(true); };

    const filtered = wallets.filter(m => 
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.id || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / membersPerPage);
    const paginated = filtered.slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage);

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Loading wallets…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 240px 140px 180px 160px 1.5fr 140px; align-items: center; }
                
                @media (max-width: 1280px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 1000px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 4px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
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
                        width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
                    }}>
                        <Wallet size={26} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Member Wallets</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>View and manage all member benefit wallets and transactions</p>
                    </div>
                </div>
            </div>

            {/* ──────── FILTERS ──────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 40, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={16} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by member name, ID or branch…" 
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
            </div>

            {/* ──────── TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    {/* Header */}
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Member', 'Member ID', 'Branch', 'Balance', 'Last Action', 'Actions'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {/* Body */}
                    {paginated.length > 0 ? paginated.map((m, idx) => {
                        const w = walletData[m.id] || { balance: 0, lastTransaction: 'N/A' };
                        return (
                            <div key={m.id} style={{ padding: '16px 22px', borderBottom: idx < paginated.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ display: 'none' }} className="mobile-label">Member</span>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>{(m.name || '?').charAt(0)}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.name}</div>
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">ID</span>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: 'monospace' }}>#{m.id}</div>
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Branch</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.muted }}>
                                        <Building2 size={12} color={T.subtle} /> {m.branch}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Balance</span>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: w.balance >= 0 ? T.green : T.rose }}>
                                        <IndianRupee size={12} style={{ display: 'inline', verticalAlign: 'baseline', fontWeight: 900 }} /> {Math.abs(w.balance).toFixed(2)}
                                        {w.balance < 0 && ' (DR)'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Event</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: T.muted }}>
                                        <History size={11} color={T.subtle} /> {w.lastTransaction}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'none' }} className="mobile-label">Actions</span>
                                    <ActionBtn onClick={() => handleViewWallet(m)}><Eye size={14} strokeWidth={2.5} /> View Wallet</ActionBtn>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Wallet size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>No wallets found</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No wallets found matching your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${T.bg}`, background: T.surface, borderRadius: '0 0 18px 18px', flexWrap: 'wrap', gap: 12, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>Showing <span style={{ color: T.text, fontWeight: 800 }}>{(currentPage - 1) * membersPerPage + 1}</span>–<span style={{ color: T.text, fontWeight: 800 }}>{Math.min(currentPage * membersPerPage, filtered.length)}</span> of <span style={{ color: T.text, fontWeight: 800 }}>{filtered.length}</span> members</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: currentPage === 1 ? 'transparent' : T.surface, color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer' }}><ChevronLeft size={16} /></button>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                const active = currentPage === p;
                                return <button key={p} onClick={() => setCurrentPage(p)} style={{ minWidth: 32, height: 32, borderRadius: 8, padding: '0 8px', background: active ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface, color: active ? '#fff' : T.text, border: active ? 'none' : `1px solid ${T.border}`, fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: active ? `0 4px 10px rgba(124,92,252,0.3)` : 'none' }}>{p}</button>
                            })}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: currentPage === totalPages ? 'transparent' : T.surface, color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            <WalletDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                memberData={selectedMember} 
                walletData={walletData} 
                setWalletData={setWalletData} 
            />
        </div>
    );
};

const IndianRupee = ({ size, style }) => (
    <span style={{ fontSize: size, ...style }}>₹</span>
);

export default WalletList;
