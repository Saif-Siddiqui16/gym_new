import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Send,
    FileText,
    MessageSquare,
    History,
    Loader2,
    CheckCircle2,
    XCircle,
    Bell,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchCommStats, fetchAnnouncements, fetchCommLogs } from '../../../api/communication/communicationApi';
import AnnouncementFormDrawer from './AnnouncementFormDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';

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
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const Announcements = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        messagesSent: 0,
        templates: 0
    });
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const branchId = user?.tenantId;
            const [statsData, annData, logsData] = await Promise.all([
                fetchCommStats(branchId),
                fetchAnnouncements({ branchId }),
                fetchCommLogs({ branchId })
            ]);
            setStats(statsData || { totalAnnouncements: 0, activeAnnouncements: 0, messagesSent: 0, templates: 0 });
            setAnnouncements(annData || []);
            setLogs(logsData || []);
        } catch (error) {
            console.error('Failed to load communication data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.tenantId]);

    const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, style = {} }) => (
        <button
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{
                height: 48, padding: '0 24px', borderRadius: 14, border: variant === 'outline' ? `2.5px solid ${T.border}` : 'none',
                background: variant === 'outline' ? '#fff' : T.accent, color: variant === 'outline' ? T.text : '#fff',
                fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', ...style
            }}
        >
            {Icon && <Icon size={18} strokeWidth={2.5} />}
            {children}
        </button>
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .tab-btn:hover { color: ${T.accent} !important; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <Megaphone size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Communication Hub</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Broadcast updates, alerts and stay connected with members</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ActionButton variant="outline" onClick={() => setIsTemplatesOpen(true)} icon={FileText}>Templates</ActionButton>
                    <ActionButton variant="outline" onClick={() => setIsBroadcastOpen(true)} icon={Send}>Broadcast</ActionButton>
                    <ActionButton onClick={() => setIsCreateOpen(true)} icon={Plus}>New Alert</ActionButton>
                </div>
            </div>

            {/* KPI Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                {[
                    { label: 'Total Alerts', value: stats.totalAnnouncements, icon: Megaphone, color: T.accent, bg: T.accentLight },
                    { label: 'Live Now', value: stats.activeAnnouncements, icon: Megaphone, color: T.green, bg: T.greenLight },
                    { label: 'Messages Sent', value: stats.messagesSent, icon: Send, color: T.blue, bg: T.blueLight },
                    { label: 'Custom Templates', value: stats.templates, icon: FileText, color: T.amber, bg: T.amberLight },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 28, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h4 style={{ margin: '2px 0 0', fontSize: 24, fontWeight: 900, color: T.text }}>{loading ? '...' : (stat.value || 0).toLocaleString()}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Tabs & Main Area */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out', minHeight: 600 }}>
                {/* Custom Tabs */}
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, background: T.bg, padding: 6, borderRadius: 18 }}>
                        {['Announcements', 'Communication Logs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="tab-btn"
                                style={{
                                    padding: '10px 24px', borderRadius: 14, border: 'none',
                                    background: activeTab === tab ? '#fff' : 'transparent',
                                    color: activeTab === tab ? T.accent : T.muted,
                                    fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={loadData}
                        style={{ width: 44, height: 44, borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
                    </button>
                </div>

                <div style={{ padding: 32 }}>
                    {loading ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                            <Loader2 size={48} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                            <p style={{ fontSize: 13, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fetching Signals...</p>
                        </div>
                    ) : activeTab === 'Announcements' ? (
                        announcements.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                                {announcements.map((ann) => (
                                    <div 
                                        key={ann.id} 
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.borderColor = T.accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.bg; }}
                                        style={{ background: '#fff', border: `2px solid ${T.bg}`, borderRadius: 28, padding: 24, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 16, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Bell size={22} strokeWidth={2.5} />
                                            </div>
                                            <div style={{ 
                                                padding: '6px 12px', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                background: ann.priority >= 7 ? T.roseLight : ann.priority >= 4 ? T.amberLight : T.bg,
                                                color: ann.priority >= 7 ? T.rose : ann.priority >= 4 ? T.amber : T.muted
                                            }}>
                                                {ann.priority >= 7 ? 'Urgent' : ann.priority >= 4 ? 'High Priority' : 'Normal'}
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{ann.title}</h3>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: T.muted, lineHeight: 1.6, margin: '0 0 24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.content}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: `1px solid ${T.bg}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                                                <History size={14} />
                                                {new Date(ann.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: ann.status === 'Active' ? T.green : T.muted, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                                                <div style={{ width: 6, height: 6, borderRadius: 3, background: ann.status === 'Active' ? T.green : T.subtle }} />
                                                {ann.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24 }}>
                                    <Megaphone size={48} />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Announcements</h3>
                                <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 10 }}>Start broadcasting to keep your members informed.</p>
                            </div>
                        )
                    ) : (
                        logs.length > 0 ? (
                            <div style={{ borderRadius: 24, border: `1.5px solid ${T.bg}`, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: T.bg }}>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Channel</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message Preview</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Log Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} style={{ borderBottom: `1.5px solid ${T.bg}`, transition: '0.2s', background: '#fff' }}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ padding: '6px 14px', borderRadius: 10, background: T.accentLight, color: T.accent, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', display: 'inline-flex' }}>
                                                        {log.channel}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', color: T.text, fontSize: 13, fontWeight: 600, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.message}
                                                </td>
                                                <td style={{ padding: '20px 24px', color: T.muted, fontSize: 12, fontWeight: 700 }}>
                                                    {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: T.greenLight, color: T.green, border: `1.5px solid ${T.green}15` }}>
                                                        <CheckCircle2 size={12} strokeWidth={3} />
                                                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>Successfully Sent</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24 }}>
                                    <History size={48} />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Logs History</h3>
                                <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 10 }}>Logs of all automated and manual sends will appear here.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Drawers */}
            <AnnouncementFormDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => { loadData(); setIsCreateOpen(false); }} />
            <BroadcastMessageDrawer isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} onSuccess={() => { loadData(); setIsBroadcastOpen(false); }} />
            <MessageTemplatesDrawer isOpen={isTemplatesOpen} onClose={() => { setIsTemplatesOpen(false); loadData(); }} />
        </div>
    );
};

export default Announcements;
