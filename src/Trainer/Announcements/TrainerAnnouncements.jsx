import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    MessageSquare,
    Layout,
    Send,
    Plus,
    CheckCircle2,
    History,
    Calendar,
    Search,
    Clock,
    Users
} from 'lucide-react';
import Card from '../../components/ui/Card';
import CreateAnnouncementDrawer from './CreateAnnouncementDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';
import { getCommStats, getAnnouncements, getCommLogs } from '../../api/communication/communicationApi';
import { useBranchContext } from '../../context/BranchContext';
import { toast } from 'react-hot-toast';

const TrainerAnnouncements = () => {
    const { selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('Announcements');
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false);
    const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);

    const [stats, setStats] = useState({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        messagesSent: 0,
        templates: 0
    });
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, annRes, logsRes] = await Promise.all([
                getCommStats(selectedBranch),
                getAnnouncements(selectedBranch),
                getCommLogs(selectedBranch)
            ]);
            setStats(statsRes);
            setAnnouncements(annRes);
            setLogs(logsRes);
        } catch (error) {
            console.error('Error fetching communication data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBranch]);

    /* ─────────────────────────────────────────────────────────────────────────────
       DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
       ───────────────────────────────────────────────────────────────────────── */
    const T = {
        accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
        border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
        muted: '#7B7A8E', subtle: '#B0ADCC',
        shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
        bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
        cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif"
    };

    const StatItem = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
        const colorMap = {
            primary: { bg: '#F0ECFF', text: T.accent, iconBg: T.accent },
            success: { bg: '#ECFDF5', text: '#059669', iconBg: '#059669' },
            warning: { bg: '#FFF7ED', text: '#EA580C', iconBg: '#EA580C' },
        };
        const st = colorMap[color] || colorMap.primary;

        return (
            <div style={{
                background: '#fff', borderRadius: 24, padding: '24px 28px', border: `1px solid ${T.border}`,
                boxShadow: T.cardShadow, transition: '0.3s', display: 'flex', flexDirection: 'column', gap: 12,
                cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }} className="group hover:-translate-y-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
                    </div>
                    <div style={{ 
                        width: 48, height: 48, borderRadius: 14, background: st.bg, color: st.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
                    }} className="group-hover:scale-110">
                        {Icon && <Icon size={24} strokeWidth={2.5} />}
                    </div>
                </div>
                {subtitle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: st.text, padding: '4px 10px', background: st.bg, borderRadius: 8, textTransform: 'uppercase' }}>{subtitle}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 32px 64px', fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
            `}</style>

            {/* PREMIUM HEADER BANNER */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`,
                position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Megaphone size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>
                            Communication Hub
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                            <span style={{ padding: '4px 10px', background: '#F0ECFF', color: T.accent, borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Broadcasting System
                            </span>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.border }} />
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: 0 }}>Manage member engagement and live updates</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={() => setIsTemplatesDrawerOpen(true)}
                        style={{ height: 48, padding: '0 24px', background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 16, color: T.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 10 }}
                        className="hover:bg-slate-50"
                    >
                        <Layout size={16} color={T.accent} /> Templates
                    </button>
                    <button
                        onClick={() => setIsBroadcastDrawerOpen(true)}
                        style={{ height: 48, padding: '0 24px', background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 16, color: T.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 10 }}
                        className="hover:bg-slate-50"
                    >
                        <Send size={16} color={T.accent} /> Broadcast
                    </button>
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        style={{ height: 48, padding: '0 24px', background: T.accent, border: 'none', borderRadius: 16, color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', boxShadow: `0 8px 16px ${T.accent}30`, display: 'flex', alignItems: 'center', gap: 10 }}
                        className="hover:scale-105"
                    >
                        <Plus size={18} strokeWidth={3} /> New Announcement
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
                <StatItem title="Total Announcements" value={stats.totalAnnouncements} subtitle="All time" icon={Megaphone} color="primary" />
                <StatItem title="Active" value={stats.activeAnnouncements} subtitle="Visible" icon={CheckCircle2} color="success" />
                <StatItem title="Messages Sent" value={stats.messagesSent} subtitle="Outreach" icon={MessageSquare} color="warning" />
                <StatItem title="Templates" value={stats.templates} subtitle="Saved drafts" icon={Layout} color="primary" />
            </div>

            {/* Tabs Section */}
            <div style={{ display: 'flex', gap: 2, background: '#F1F0F9', padding: 4, borderRadius: 20, width: 'fit-content', marginBottom: 32 }}>
                {['Announcements', 'Communication Logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 32px', borderRadius: 16, border: 'none', background: activeTab === tab ? '#fff' : 'transparent',
                            color: activeTab === tab ? T.accent : T.muted, fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                            letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s',
                            boxShadow: activeTab === tab ? '0 4px 12px rgba(124, 92, 252, 0.1)' : 'none'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'Announcements' && (
                    announcements.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                            {announcements.map((ann) => (
                                <div key={ann.id} style={{ background: '#fff', borderRadius: 24, padding: 32, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s', position: 'relative' }} className="hover:-translate-y-1">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                                        <div style={{ padding: '4px 10px', background: ann.priority > 0 ? '#FEF2F2' : T.bg, color: ann.priority > 0 ? '#EF4444' : T.muted, borderRadius: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${ann.priority > 0 ? '#FEE2E2' : T.border}` }}>
                                            {ann.priority > 0 ? 'High Priority' : 'Normal'}
                                        </div>
                                        <div style={{ padding: '4px 10px', background: ann.status === 'Active' ? '#ECFDF5' : '#FFF7ED', color: ann.status === 'Active' ? '#10B981' : '#F59E0B', borderRadius: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>
                                            {ann.status}
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 12px', letterSpacing: '-0.5px' }}>{ann.title}</h3>
                                    <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, margin: '0 0 24px', minHeight: 60 }}>{ann.content}</p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0ECFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><Users size={14} /></div>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{ann.targetRole}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.subtle }}>
                                            <Calendar size={14} />
                                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, borderRadius: 32, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24, boxShadow: T.cardShadow }}><Megaphone size={48} strokeWidth={1.5} style={{ opacity: 0.3 }} /></div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>No active transmissions</h3>
                            <p style={{ fontSize: 13, color: T.subtle, margin: 0, fontWeight: 600 }}>Ready to broadcast? Create your first announcement to reach your members.</p>
                        </div>
                    )
                )}

                {activeTab === 'Communication Logs' && (
                    logs.length > 0 ? (
                        <div style={{ background: '#fff', borderRadius: 28, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.cardShadow }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB' }}>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Recipient Id</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Channel</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Payload Content</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} style={{ borderTop: `1px solid ${T.border}`, transition: '0.3s' }} className="hover:bg-slate-50/50">
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: 12, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>{log.memberId ? `Member #${log.memberId}` : 'Broadcast Group'}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <MessageSquare size={16} color={T.accent} />
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>{log.channel}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <p style={{ fontSize: 12, color: T.muted, margin: 0, fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</p>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ padding: '6px 12px', background: '#ECFDF5', color: '#059669', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{log.status}</span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.subtle }}>
                                                    <Clock size={14} />
                                                    <span style={{ fontSize: 11, fontWeight: 800 }}>{new Date(log.createdAt).toLocaleString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                            <History size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
                            <p style={{ fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Archive is empty</p>
                        </div>
                    )
                )}
            </div>

            {/* Drawers */}
            <CreateAnnouncementDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={(data) => {
                    toast.success('Announcement created successfully');
                    fetchData();
                }}
            />
            <BroadcastMessageDrawer
                isOpen={isBroadcastDrawerOpen}
                onClose={() => setIsBroadcastDrawerOpen(false)}
                onSuccess={(data) => {
                    toast.success('Broadcast sent successfully');
                    fetchData();
                }}
            />
            <MessageTemplatesDrawer
                isOpen={isTemplatesDrawerOpen}
                onClose={() => {
                    setIsTemplatesDrawerOpen(false);
                    fetchData(); // In case a template was added
                }}
            />
        </div>
    );
};

export default TrainerAnnouncements;
