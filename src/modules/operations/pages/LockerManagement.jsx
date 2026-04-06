import React, { useState, useEffect } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import {
    Search,
    Lock,
    Unlock,
    Key,
    User,
    Settings,
    ChevronDown,
    LayoutGrid,
    List,
    AlertCircle,
    Package,
    Activity,
    Clock,
    Filter,
    X,
    Plus,
    RefreshCw
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import AddLockerDrawer from './AddLockerDrawer';
import BulkCreateLockersDrawer from './BulkCreateLockersDrawer';
import LockerDetailsDrawer from './LockerDetailsDrawer';

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

const LockerManagement = () => {
    const { selectedBranch } = useBranchContext();
    const [lockers, setLockers] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, maintenance: 0, occupancyRate: 0 });
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewMode, setViewMode] = useState('grid');

    // Drawers
    const [drawerType, setDrawerType] = useState(null); // 'add', 'bulk', 'details'
    const [selectedLocker, setSelectedLocker] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lockerData, statsData] = await Promise.all([
                lockerApi.getAllLockers({
                    branchId: selectedBranch,
                    search: searchTerm,
                    status: statusFilter === 'All Status' ? null : statusFilter
                }),
                lockerApi.getStats({ branchId: selectedBranch })
            ]);
            setLockers(lockerData || []);
            setStats(statsData || { total: 0, available: 0, assigned: 0, maintenance: 0, occupancyRate: 0 });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load locker data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch, searchTerm, statusFilter]);

    const openDrawer = (type, data = null) => {
        setDrawerType(type);
        setSelectedLocker(data);
    };

    const closeDrawer = () => {
        setDrawerType(null);
        setSelectedLocker(null);
    };

    const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, style = {} }) => (
        <button
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{
                height: 48, padding: '0 24px', borderRadius: 14, border: variant === 'outline' ? `2px solid ${T.border}` : 'none',
                background: variant === 'outline' ? '#fff' : T.accent, color: variant === 'outline' ? T.text : '#fff',
                fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
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
                .locker-row:hover { background: ${T.accentLight}50 !important; cursor: pointer; }
                input::placeholder, select::placeholder { color: ${T.subtle}; opacity: 1; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <Lock size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Locker Management</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Manage assignments, availability and maintenance</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ActionButton onClick={() => openDrawer('bulk')} variant="outline" icon={Settings}>Bulk Create</ActionButton>
                    <ActionButton onClick={() => openDrawer('add')} icon={Plus}>Add Locker</ActionButton>
                </div>
            </div>

            {/* KPI Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                {[
                    { label: 'Total Units', value: stats.total, icon: Package, color: T.accent, bg: T.accentLight },
                    { label: 'Available', value: stats.available, icon: Unlock, color: T.green, bg: T.greenLight },
                    { label: 'Assigned', value: stats.assigned, icon: User, color: T.blue, bg: T.blueLight, subtitle: `${stats.occupancyRate}% Occupancy` },
                    { label: 'In Service', value: stats.maintenance, icon: AlertCircle, color: T.amber, bg: T.amberLight },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 28, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h4 style={{ margin: '2px 0 0', fontSize: 24, fontWeight: 900, color: T.text }}>{stat.value}</h4>
                            {stat.subtitle && <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, color: T.blue }}>{stat.subtitle}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                {/* Filters Toolbar */}
                <div style={{ padding: 24, borderBottom: `1.5px solid ${T.bg}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 300 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} size={18} />
                            <input 
                                type="text"
                                placeholder="Search locker ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: 48, background: T.bg, border: 'none', borderRadius: 16, padding: '0 20px 0 52px', color: T.text, fontSize: 13, fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                        <div style={{ position: 'relative', width: 200 }}>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '100%', height: 48, background: T.bg, border: 'none', borderRadius: 16, padding: '0 40px 0 20px', color: T.text, fontSize: 13, fontWeight: 600, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                            >
                                <option>All Status</option>
                                <option>Available</option>
                                <option>Assigned</option>
                                <option>Maintenance</option>
                                <option>Reserved</option>
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ background: T.bg, padding: 4, borderRadius: 14, display: 'flex', gap: 4 }}>
                            <TabButton active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')}>Overview</TabButton>
                            <TabButton active={activeTab === 'Assigned'} onClick={() => setActiveTab('Assigned')}>Members</TabButton>
                        </div>
                        <div style={{ background: T.bg, padding: 4, borderRadius: 14, display: 'flex', gap: 4 }}>
                            <IconButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} />
                            <IconButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
                        </div>
                    </div>
                </div>

                {/* Locker Body */}
                <div style={{ padding: 32 }}>
                    {loading ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                            <RefreshCw size={48} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                            <p style={{ fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calibrating Lockers...</p>
                        </div>
                    ) : lockers.length === 0 ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24 }}>
                                <Lock size={48} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Units Found</h3>
                            <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 8 }}>We couldn't find any lockers matching your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'Overview' ? (
                                viewMode === 'grid' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16 }}>
                                        {lockers.map((locker) => (
                                            <LockerCard key={locker.id} locker={locker} onClick={() => openDrawer('details', locker)} />
                                        ))}
                                    </div>
                                ) : (
                                    <LockerTable lockers={lockers} onRowClick={(l) => openDrawer('details', l)} />
                                )
                            ) : (
                                <AssignedMemberTable lockers={lockers.filter(l => l.status === 'Assigned')} onRowClick={(l) => openDrawer('details', l)} />
                            )}
                        </>
                    )}
                </div>

                {/* Legend */}
                {!loading && lockers.length > 0 && activeTab === 'Overview' && (
                    <div style={{ padding: '24px 32px', background: T.bg, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                        <LegendItem color={T.green} label="Available" />
                        <LegendItem color={T.accent} label="Assigned" />
                        <LegendItem color={T.amber} label="Maintenance" />
                        <LegendItem color={T.indigo} label="Reserved" />
                        <LegendItem color={T.rose} label="Expired" />
                    </div>
                )}
            </div>

            {/* Drawers */}
            <RightDrawer isOpen={drawerType === 'add'} onClose={closeDrawer} title="Add New Locker" subtitle="Manual registry">
                <AddLockerDrawer onClose={closeDrawer} onSuccess={loadData} />
            </RightDrawer>

            <RightDrawer isOpen={drawerType === 'bulk'} onClose={closeDrawer} title="Bulk Operations" subtitle="Process multiple units">
                <BulkCreateLockersDrawer onClose={closeDrawer} onSuccess={loadData} />
            </RightDrawer>

            {drawerType === 'details' && selectedLocker && (
                <LockerDetailsDrawer isOpen={drawerType === 'details'} locker={selectedLocker} onClose={closeDrawer} onSuccess={loadData} />
            )}
        </div>
    );
};

/* ── UI COMPONENTS ── */

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: active ? '#fff' : 'transparent', color: active ? T.accent : T.muted,
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
            cursor: 'pointer', transition: '0.2s', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
        }}
    >
        {children}
    </button>
);

const IconButton = ({ active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', background: active ? '#fff' : 'transparent',
            color: active ? T.accent : T.muted, cursor: 'pointer', transition: '0.2s',
            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
        }}
    >
        <Icon size={18} strokeWidth={2.5} />
    </button>
);

const LockerCard = ({ locker, onClick }) => {
    const isAvailable = locker.status === 'Available';
    const isAssigned = locker.status === 'Assigned';
    const isMaintenance = locker.status === 'Maintenance';
    const isReserved = locker.status === 'Reserved';
    const isExpired = isAssigned && locker.assignedTo?.expiryDate && new Date(locker.assignedTo.expiryDate) < new Date();

    let bgColor = T.bg;
    let textColor = T.muted;
    let dotColor = T.subtle;
    let borderColor = 'transparent';

    if (isAvailable) { bgColor = T.greenLight; textColor = T.green; dotColor = T.green; borderColor = `${T.green}20`; }
    else if (isAssigned) {
        if (isExpired) { bgColor = T.roseLight; textColor = T.rose; dotColor = T.rose; borderColor = `${T.rose}20`; }
        else { bgColor = T.accentLight; textColor = T.accent; dotColor = T.accent; borderColor = `${T.accent}20`; }
    }
    else if (isMaintenance) { bgColor = T.amberLight; textColor = T.amber; dotColor = T.amber; borderColor = `${T.amber}20`; }
    else if (isReserved) { bgColor = T.indigoLight; textColor = T.indigo; dotColor = T.indigo; borderColor = `${T.indigo}20`; }

    return (
        <div
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = T.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{ 
                height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: bgColor, borderRadius: 20, border: `2px solid ${borderColor}`, cursor: 'pointer',
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative'
            }}
        >
            <div style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: 3, background: dotColor }} />
            <Lock size={20} color={textColor} strokeWidth={2.5} style={{ marginBottom: 6 }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: textColor }}>{locker.number}</span>
        </div>
    );
};

const LockerTable = ({ lockers, onRowClick }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
            <tr style={{ background: T.bg }}>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Number</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configuration</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
            </tr>
        </thead>
        <tbody>
            {lockers.map(locker => (
                <tr key={locker.id} className="locker-row" style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.2s' }} onClick={() => onRowClick(locker)}>
                    <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 900, color: T.text }}># {locker.number}</td>
                    <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: T.muted }}>{locker.size} Unit</td>
                    <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: T.muted }}>{locker.area || '--'}</td>
                    <td style={{ padding: '20px 24px' }}><StatusBadge status={locker.status} /></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const AssignedMemberTable = ({ lockers, onRowClick }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
            <tr style={{ background: T.bg }}>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Locker</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member details</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assignment ID</th>
                <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Safety Expiry</th>
            </tr>
        </thead>
        <tbody>
            {lockers.map(locker => (
                <tr key={locker.id} className="locker-row" style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.2s' }} onClick={() => onRowClick(locker)}>
                    <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 900, color: T.text }}>{locker.number}</td>
                    <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 800, color: T.text }}>{locker.assignedTo?.name || 'N/A'}</td>
                    <td style={{ padding: '20px 24px', fontSize: 12, fontWeight: 700, color: T.accent }}>{locker.assignedTo?.memberId || '--'}</td>
                    <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                            padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 900,
                            background: new Date(locker.assignedTo?.expiryDate) < new Date() ? T.roseLight : T.bg,
                            color: new Date(locker.assignedTo?.expiryDate) < new Date() ? T.rose : T.muted
                        }}>
                            {locker.assignedTo?.expiryDate ? new Date(locker.assignedTo.expiryDate).toLocaleDateString('en-GB') : '--'}
                        </span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const StatusBadge = ({ status }) => {
    const config = {
        Available: { bg: T.greenLight, text: T.green },
        Assigned: { bg: T.accentLight, text: T.accent },
        Maintenance: { bg: T.amberLight, text: T.amber },
        Reserved: { bg: T.indigoLight, text: T.indigo }
    };
    const { bg, text } = config[status] || { bg: T.bg, text: T.muted };
    return (
        <span style={{ padding: '6px 14px', borderRadius: 12, background: bg, color: text, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {status}
        </span>
    );
};

const LegendItem = ({ color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
);

export default LockerManagement;
