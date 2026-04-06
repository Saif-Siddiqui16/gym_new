import React, { useState, useEffect } from 'react';
import { Lock, Search, Filter, Plus, ShieldCheck, ShieldAlert, Wrench, MoreVertical, RefreshCw, UserPlus, LogOut, Info, Box, LayoutGrid, List, User, Key, Users, X } from 'lucide-react';
import { getLockers } from '../../api/staff/lockerApi';
import RightDrawer from '../../components/common/RightDrawer';
import LockerFormDrawer from './LockerFormDrawer';
import LockerDetailDrawer from './LockerDetailDrawer';
import CreateLockerDrawer from './CreateLockerDrawer';
import BulkCreateLockersDrawer from '../../modules/operations/pages/BulkCreateLockersDrawer';
import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - Amber Accent)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#F59E0B', accent2: '#FBBF24', accentLight: '#FEF3C7', accentMid: '#FDE68A',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  purple: '#7C5CFC', purpleLight: '#F0ECFF'
};

const INPUT_STYLE = {
    width: '100%', height: 48, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
    background: '#FFFFFF', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
};

const MetricCard = ({ title, value, icon: Icon, color, bg, sub, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, padding: 24, borderRadius: 28, border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover ? '0 12px 30px rgba(0,0,0,0.05)' : '0 2px 14px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {sub && (
                    <div style={{ fontSize: 9, fontWeight: 900, color: color, background: bg, padding: '4px 8px', borderRadius: 20, textTransform: 'uppercase', border: `1px solid ${color}20` }}>
                        {sub}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
            </div>
        </div>
    );
};

const LockerManagement = () => {
    const { selectedBranch } = useBranchContext();
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewMode, setViewMode] = useState('grid');

    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getLockers();
            setLockers(data);
        } catch (error) { toast.error('Failed to load lockers'); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const stats = {
        total: lockers.length,
        available: lockers.filter(l => l.status === 'Available').length,
        assigned: lockers.filter(l => l.status === 'Occupied' || l.status === 'Assigned').length,
        maintenance: lockers.filter(l => l.status === 'Maintenance').length,
        occupancy: lockers.length > 0 ? `${Math.round((lockers.filter(l => l.status !== 'Available').length / lockers.length) * 100)}%` : '0%'
    };

    const filteredLockers = lockers.filter(locker => {
        const matchesSearch = locker.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All Status' || locker.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (locker) => {
        setSelectedLocker(locker);
        if (locker.status === 'Available') setIsAssignDrawerOpen(true);
        else setIsDetailDrawerOpen(true);
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both; }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 55%, #F59E0B 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(245,158,11,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 2 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Locker Management</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)', margin: '4px 0 0', fontWeight: 600 }}>Real-time locker assignments & maintenance</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, zIndex: 2 }}>
                    <button onClick={() => setIsBulkCreateOpen(true)} style={{ padding: '0 24px', height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>BULK CREATE</button>
                    <button onClick={() => setIsCreateDrawerOpen(true)} style={{ padding: '0 24px', height: 48, borderRadius: 14, background: '#fff', color: T.accent, border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        <Plus size={18} strokeWidth={2.5} /> ADD LOCKER
                    </button>
                </div>
            </div>

            {/* QUICK STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }} className="fu">
                <MetricCard title="Total Lockers" value={stats.total} icon={Box} color={T.purple} bg={T.purpleLight} index={0} />
                <MetricCard title="Available" value={stats.available} icon={ShieldCheck} color={T.green} bg={T.greenLight} index={1} />
                <MetricCard title="Occupied" value={stats.assigned} icon={User} color={T.accent} bg={T.accentLight} sub={stats.occupancy} index={2} />
                <MetricCard title="Maintenance" value={stats.maintenance} icon={Wrench} color={T.rose} bg={T.roseLight} index={3} />
            </div>

            {/* SEARCH & FILTERS */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 32, animationDelay: '0.2s', alignItems: 'center' }} className="fu">
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={22} color={T.subtle} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Search lockers by number..." 
                        style={{ ...INPUT_STYLE, paddingLeft: 52 }}
                    />
                </div>
                <div style={{ width: 220 }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ ...INPUT_STYLE, appearance: 'none', background: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23B0ADCC%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E") no-repeat right 16px center`, backgroundSize: '1.2rem', cursor: 'pointer' }}
                    >
                        <option>All Status</option>
                        <option>Available</option>
                        <option>Assigned</option>
                        <option>Maintenance</option>
                        <option>Reserved</option>
                    </select>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, border: `2px solid ${T.border}`, padding: 4, display: 'flex', gap: 4 }}>
                    <button onClick={() => setViewMode('grid')} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: viewMode === 'grid' ? T.accent : 'transparent', color: viewMode === 'grid' ? '#fff' : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: viewMode === 'list' ? T.accent : 'transparent', color: viewMode === 'list' ? '#fff' : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><List size={20} /></button>
                </div>
            </div>

            {/* TAB CONTENT Area */}
            <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }} className="fu">
                <div style={{ padding: 12, background: '#F9F8FF', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
                    {['Overview', `Occupied (${stats.assigned})`].map(tab => {
                        const isOverview = tab === 'Overview';
                        return (
                            <button key={tab} onClick={() => setActiveTab(isOverview ? 'Overview' : 'Assigned')} style={{ padding: '10px 24px', borderRadius: 14, background: (isOverview && activeTab === 'Overview') || (!isOverview && activeTab === 'Assigned') ? '#fff' : 'transparent', border: (isOverview && activeTab === 'Overview') || (!isOverview && activeTab === 'Assigned') ? `1px solid ${T.border}` : 'none', color: (isOverview && activeTab === 'Overview') || (!isOverview && activeTab === 'Assigned') ? T.amber : T.muted, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s', boxShadow: (isOverview && activeTab === 'Overview') || (!isOverview && activeTab === 'Assigned') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                                {tab}
                            </button>
                        );
                    })}
                </div>

                <div style={{ padding: 32 }}>
                    {activeTab === 'Overview' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
                            {filteredLockers.map(locker => {
                                let color = T.green, bg = T.greenLight;
                                if (locker.status === 'Assigned' || locker.status === 'Occupied') { color = T.muted; bg = T.bg; }
                                else if (locker.status === 'Maintenance') { color = T.rose; bg = T.roseLight; }
                                else if (locker.status === 'Reserved') { color = T.purple; bg = T.purpleLight; }
                                
                                return (
                                    <div key={locker.id} onClick={() => handleAction(locker)} style={{ width: '100%', aspectRatio: '1/1', background: bg, borderRadius: 24, border: `2px solid ${color}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                        <Lock size={28} color={color} strokeWidth={2.5} />
                                        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{locker.number}</div>
                                        <div style={{ fontSize: 9, fontWeight: 900, color: color, textTransform: 'uppercase' }}>{locker.status}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9F8FF', borderBottom: `1px solid ${T.border}` }}>
                                    {['Locker #', 'Member Name', 'Member ID', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lockers.filter(l => l.status === 'Occupied' || l.status === 'Assigned').map((l, i) => (
                                    <tr key={l.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                        <td style={{ padding: '20px 32px' }}><div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>#{l.number}</div></td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{l.assignedTo?.name?.[0] || 'M'}</div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{l.assignedTo?.name || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}><div style={{ fontSize: 12, fontWeight: 800, color: T.muted }}>{l.assignedTo?.memberId || '—'}</div></td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <button onClick={() => handleAction(l)} style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, color: T.muted, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Info size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <LockerFormDrawer isOpen={isAssignDrawerOpen} onClose={() => setIsAssignDrawerOpen(false)} selectedLocker={selectedLocker} onSuccess={loadData} />
            <LockerDetailDrawer isOpen={isDetailDrawerOpen} onClose={() => setIsDetailDrawerOpen(false)} selectedLocker={selectedLocker} onSuccess={loadData} />
            <CreateLockerDrawer isOpen={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} onSuccess={loadData} />
            <RightDrawer isOpen={isBulkCreateOpen} onClose={() => setIsBulkCreateOpen(false)}><BulkCreateLockersDrawer onClose={() => setIsBulkCreateOpen(false)} onSuccess={loadData} /></RightDrawer>
        </div>
    );
};

export default LockerManagement;
