import React, { useState, useEffect } from 'react';
import {
    Megaphone, Calendar, BellRing, Clock, AlertCircle, 
    ChevronRight, Search, Sparkles, Info, RefreshCw, Layers, Send, X
} from 'lucide-react';
import { fetchAnnouncements } from '../../api/communication/communicationApi';
import RightDrawer from '../../components/common/RightDrawer';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const MemberAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchAnnouncements({ portal: 'member' });
            setAnnouncements(data || []);
        } catch (error) { console.error('Error fetching announcements:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const getPriorityStyle = (priority) => {
        const p = parseInt(priority) || 0;
        if (p >= 8) return { color: T.rose, bg: T.roseLight, icon: AlertCircle };
        if (p >= 4) return { color: T.amber, bg: T.amberLight, icon: Info };
        return { color: T.accent, bg: T.accentLight, icon: Info };
    };

    if (loading && announcements.length === 0) return <Loader message="Broadcasting updates..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ... style tags ... */}

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn header-banner">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Megaphone size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="banner-title" style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Announcements</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Stay updated with the latest news from your gym</p>
                    </div>
                </div>
                <div className="header-banner-badge" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative', zIndex: 2 }}>
                    <BellRing size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Hub Update</span>
                </div>
            </div>

            <div className="announcement-container" style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1000, margin: '0 auto' }}>

                {/* ANNOUNCEMENTS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <SectionHeader icon={Sparkles} title="Global Broadcasts" subtitle="Official communications from gym management" />
                    
                    {announcements.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {announcements.map((item, idx) => {
                                const style = getPriorityStyle(item.priority);
                                const Icon = style.icon;
                                return (
                                    <PremiumCard key={item.id} index={idx} className="premium-card" style={{ padding: '32px 40px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `${style.color}05`, blur: '40px' }} />
                                        
                                        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Icon size={22} strokeWidth={2.5} />
                                                </div>
                                                <div style={{ padding: '4px 12px', borderRadius: 8, background: style.bg, color: style.color, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.priority ? `Priority ${item.priority}` : 'General Update'}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>
                                                <Calendar size={14} />
                                                {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                            </div>
                                        </div>

                                        <h3 className="announcement-title" style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: '0 0 12px', letterSpacing: '-0.5px' }}>{item.title}</h3>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: T.muted, lineHeight: 1.6, margin: '0 0 28px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>

                                        <div className="announcement-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${T.bg}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.subtle }}>
                                                <BellRing size={16} />
                                                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Broadcast</span>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedAnnouncement(item)}
                                                style={{ padding: '12px 24px', borderRadius: 12, background: T.bg, border: `1.5px solid ${T.border}`, color: T.accent, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = T.accent; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.border; }}
                                            >
                                                Read Fully <ChevronRight size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </PremiumCard>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 40px', background: T.surface, borderRadius: 32, border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                             <Megaphone size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
                             <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text }}>No Broadcasts Currently</h3>
                             <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>You're currently up to date with all gym news.</p>
                        </div>
                    )}
                </div>
            </div>

            <RightDrawer isOpen={!!selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} title="Official Announcement" subtitle={selectedAnnouncement?.title}>
                {selectedAnnouncement && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ padding: '6px 14px', borderRadius: 8, background: T.accentLight, color: T.accent, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>Authorized Communication</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: T.subtle }}>
                                <Calendar size={14} />
                                {new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-GB')}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: '0 0 12px', letterSpacing: '-0.8px', lineHeight: 1.2 }}>{selectedAnnouncement.title}</h3>
                            <div style={{ height: 4, width: 44, background: T.accent, borderRadius: 2 }} />
                        </div>

                        <div style={{ padding: 28, borderRadius: 24, background: T.bg, border: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{selectedAnnouncement.content}</p>
                        </div>

                        <div style={{ padding: 24, borderRadius: 20, background: T.accentLight, border: `1px solid ${T.accentMid}`, display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                             <Sparkles size={24} color={T.accent} />
                             <p style={{ fontSize: 11, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.5 }}>Stay informed by checking this hub regularly for upcoming events and gym updates.</p>
                        </div>

                        <button 
                            onClick={() => setSelectedAnnouncement(null)}
                            style={{ height: 56, borderRadius: 16, background: T.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,92,252,0.1)', marginTop: 8 }}
                        >Understood</button>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default MemberAnnouncements;
