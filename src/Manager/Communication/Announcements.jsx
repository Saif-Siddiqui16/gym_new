import React, { useState, useEffect } from 'react';
import {
    Megaphone, Search, Filter, Plus, Clock, Users, CheckCircle, AlertCircle,
    Trash2, Edit2, MoreVertical, Calendar, Send, FileText, History, Loader2,
    MessageSquare, ShieldCheck, Zap, Repeat, Share2, Sparkles, Layout, Radio
} from 'lucide-react';
import CreateAnnouncementDrawer from './CreateAnnouncementDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';
import { fetchAnnouncements, fetchCommStats, fetchCommLogs, deleteAnnouncement } from '../../api/communication/communicationApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

// Sub-component: Header Banner
const CommunicationHeader = ({ actions }) => (
    <div style={{ padding: '0 8px 30px' }} className="fu fu1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                 <div style={{ width: 4, height: 32, background: T.accent, borderRadius: 4 }} />
                 <div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-1px' }}>Communication Hub</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                         <span style={{ fontSize: 10, fontWeight: 900, color: T.accent, background: T.accentLight, padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Broadcasting System</span>
                         <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.subtle }} />
                         <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: 0 }}>Manage member engagement and updates</p>
                    </div>
                 </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {actions}
            </div>
        </div>
    </div>
);

// Sub-component: Quick Stat Card
const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div style={{
        background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`,
        padding: 24, flex: 1, position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(124,92,252,0.02)'
    }} className={`fu fu${index + 2}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                 <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{title}</p>
                 <div style={{ fontSize: 32, fontWeight: 900, color: T.text }}>{value}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} />
            </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 10, fontWeight: 900, color: color, background: bg, display: 'inline-block', padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase' }}>{subtitle}</div>
    </div>
);

const Announcements = () => {
    const { user } = useAuth();
    const [subTab, setSubTab] = useState('active');
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalAnnouncements: 0, activeAnnouncements: 0, messagesSent: 0, templates: 0 });
    const [loading, setLoading] = useState(true);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState(null);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const branchId = user?.tenantId;
            const [annData, statsData, logsData] = await Promise.all([
                fetchAnnouncements({ branchId }),
                fetchCommStats(branchId),
                fetchCommLogs(branchId)
            ]);
            setAnnouncements(annData || []);
            setStats(statsData || { totalAnnouncements: 0, activeAnnouncements: 0, messagesSent: 0, templates: 0 });
            setLogs(logsData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [user?.tenantId]);

    const handleSuccess = () => { setIsCreateDrawerOpen(false); setSelectedEdit(null); fetchAllData(); };
    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteAnnouncement(confirmModal.id);
            toast.success("Deleted successfully");
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchAllData();
        } catch (e) { toast.error("Failed to delete"); }
        finally { setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const handleEdit = (item) => { setSelectedEdit(item); setIsCreateDrawerOpen(true); };

    const filteredList = announcements.filter(a =>
        (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.message || a.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: T.bg, flex: 1, width: '100%', overflowY: 'auto', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
                .tab-btn { border: none; background: none; padding: 12px 24px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; color: ${T.subtle}; transition: 0.3s; position: relative; }
                .tab-btn.active { color: ${T.accent}; }
                .tab-btn.active:after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: ${T.accent}; border-radius: 4px 4px 0 0; }
            `}</style>

            <CommunicationHeader 
                actions={
                    <>
                        <button onClick={() => setIsTemplatesOpen(true)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '12px 24px', borderRadius: 16, fontSize: 11, fontWeight: 800, color: T.text, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Layout size={18} /> Templates
                        </button>
                        <button onClick={() => setIsBroadcastOpen(true)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '12px 24px', borderRadius: 16, fontSize: 11, fontWeight: 800, color: T.text, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Radio size={18} /> Broadcast
                        </button>
                        <button onClick={() => { setSelectedEdit(null); setIsCreateDrawerOpen(true); }} style={{ background: T.accent, color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 24px rgba(124,92,252,0.22)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Plus size={20} /> New Announcement
                        </button>
                    </>
                }
            />

            {/* Stats Roster */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 40 }} className="fu fu2">
                <StatCard title="Total Announcements" value={stats.totalAnnouncements} icon={Megaphone} color={T.accent} bg={T.accentLight} subtitle="All Time" index={0} />
                <StatCard title="Active" value={stats.activeAnnouncements} icon={ShieldCheck} color={T.green} bg={T.greenLight} subtitle="Visible" index={1} />
                <StatCard title="Messages Sent" value={stats.messagesSent} icon={MessageSquare} color={T.amber} bg={T.amberLight} subtitle="Outreach" index={2} />
                <StatCard title="Templates" value={stats.templates} icon={Repeat} color={T.blue} bg={T.blueLight} subtitle="Saved Drafts" index={3} />
            </div>

            {/* Tabs & Content */}
            <div className="fu fu3">
                <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${T.border}`, marginBottom: 30 }}>
                    <button onClick={() => setSubTab('active')} className={`tab-btn ${subTab === 'active' ? 'active' : ''}`}>Announcements</button>
                    <button onClick={() => setSubTab('logs')} className={`tab-btn ${subTab === 'logs' ? 'active' : ''}`}>Communication Logs</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {loading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center' }}>
                            <Loader2 size={40} className="animate-spin" style={{ color: T.accent, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Syncing with hub...</p>
                        </div>
                    ) : subTab === 'active' ? (
                        filteredList.length > 0 ? (
                            filteredList.map((item, i) => (
                                <div key={item.id} style={{ background: T.surface, padding: 28, borderRadius: 24, border: `1px solid ${T.border}`, display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.01)', transition: '0.3s' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 18, background: i % 2 === 0 ? T.accentLight : T.amberLight, color: i % 2 === 0 ? T.accent : T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Megaphone size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: T.subtle }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.subtle }} />
                                            <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: T.accent }}>{item.audience}</span>
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{item.title}</h3>
                                        <p style={{ fontSize: 14, color: T.muted, fontWeight: 600, margin: '6px 0 0', lineHeight: 1.5 }}>{item.message || item.content}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleEdit(item)} style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} style={{ width: 40, height: 40, borderRadius: 12, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: '50%', background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', opacity: 0.5 }}><Share2 size={40} color={T.accent} /></div>
                                <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No announcements yet</h3>
                                <p style={{ fontSize: 13, color: T.muted, margin: '8px 0 0' }}>Create your first announcement to reach your members instantly.</p>
                            </div>
                        )
                    ) : (
                        <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 24px', background: T.accentLight, color: T.accent, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr' }}>
                                <span>Sent At</span>
                                <span>Message Summary</span>
                                <span>Target</span>
                                <span>Channel</span>
                            </div>
                            {logs.length > 0 ? logs.map((log, i) => (
                                <div key={log.id || i} style={{ padding: '18px 24px', borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', fontSize: 13, alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, color: T.text }}>{new Date(log.createdAt).toLocaleString()}</span>
                                    <span style={{ fontWeight: 600, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</span>
                                    <span style={{ fontWeight: 800, color: T.accent }}>{log.audience || 'Members'}</span>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>{log.channel}</span>
                                </div>
                            )) : (
                                <div style={{ padding: 40, textAlign: 'center', color: T.subtle }}>No activity logs available</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateAnnouncementDrawer isOpen={isCreateDrawerOpen} onClose={() => { setIsCreateDrawerOpen(false); setSelectedEdit(null); }} onSuccess={handleSuccess} editData={selectedEdit} />
            <BroadcastMessageDrawer isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} onSuccess={handleSuccess} />
            <MessageTemplatesDrawer isOpen={isTemplatesOpen} onClose={() => { setIsTemplatesOpen(false); handleSuccess(); }} />
            <ConfirmationModal
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete} title="Delete Alert?"
                message="This announcement will be permanently removed from the system."
                confirmText="Delete" type="danger" loading={confirmModal.loading}
            />
        </div>
    );
};

export default Announcements;
