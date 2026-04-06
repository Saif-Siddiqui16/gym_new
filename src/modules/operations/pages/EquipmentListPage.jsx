import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Wrench,
    Monitor,
    AlertCircle,
    CheckCircle2,
    Info,
    Calendar,
    Archive,
    Trash2,
    Edit2,
    MoreVertical,
    History,
    FileText,
    TrendingUp,
    Settings,
    Banknote,
    Clock,
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import { equipmentApi } from '../../../api/equipmentApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import AddEquipmentDrawer from './AddEquipmentDrawer';

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

const EquipmentListPage = () => {
    const { selectedBranch } = useBranchContext();
    const [equipment, setEquipment] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, operational: 0, inMaintenance: 0, outOfOrder: 0, ytdCost: 0 });
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Equipment');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [equipmentData, statsData, logsData] = await Promise.all([
                equipmentApi.getAllEquipment({ branchId: selectedBranch, search: searchTerm }),
                equipmentApi.getStats({ branchId: selectedBranch }),
                equipmentApi.getMaintenanceRequests({ branchId: selectedBranch })
            ]);
            setEquipment(equipmentData || []);
            setStats(statsData || { total: 0, operational: 0, inMaintenance: 0, outOfOrder: 0, ytdCost: 0 });
            setMaintenanceLogs(logsData || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch, searchTerm]);

    const handleAddEquipment = async (data) => {
        try {
            await equipmentApi.addEquipment({ ...data, tenantId: selectedBranch });
            toast.success('Equipment added successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to add equipment');
        }
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
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .tab-btn:hover { color: ${T.accent} !important; }
                .asset-row:hover { background: ${T.accentLight}30 !important; cursor: pointer; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <Monitor size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Assets & Maintenance</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Track equipment health, maintenance history and service costs</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ActionButton onClick={() => setIsDrawerOpen(true)} icon={Plus}>Add Equipment</ActionButton>
                </div>
            </div>

            {/* KPI Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                {[
                    { label: 'Total Assets', value: stats.total, icon: Monitor, color: T.text, bg: '#fff' },
                    { label: 'Operational', value: stats.operational, icon: CheckCircle2, color: T.green, bg: T.greenLight },
                    { label: 'Servicing', value: stats.inMaintenance, icon: Clock, color: T.amber, bg: T.amberLight },
                    { label: 'Out of Order', value: stats.outOfOrder, icon: AlertCircle, color: T.rose, bg: T.roseLight },
                    { label: 'YTD Spending', value: `₹${(stats.ytdCost || 0).toLocaleString()}`, icon: Banknote, color: T.accent, bg: T.accentLight },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 28, boxShadow: T.cardShadow, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h4 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.02em' }}>{loading ? '...' : stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                {/* Search & Tabs */}
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, background: T.bg, padding: 6, borderRadius: 18 }}>
                        {['Equipment', 'Maintenance Log'].map((tab) => (
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
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, serial..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300, height: 48, background: T.bg, border: 'none', borderRadius: 16, padding: '0 20px 0 52px', color: T.text, fontSize: 13, fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={loadData}
                            style={{ width: 44, height: 44, borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, cursor: 'pointer' }}
                        >
                            <RefreshCw size={18} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: 32 }}>
                    {loading ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                            <RefreshCw size={48} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                            <p style={{ fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calibrating Assets...</p>
                        </div>
                    ) : (
                        <div style={{ borderRadius: 24, border: `1.5px solid ${T.bg}`, overflow: 'hidden' }}>
                            {activeTab === 'Equipment' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: T.bg }}>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Equipment Identity</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Details</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Status</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last Service</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equipment.length > 0 ? equipment.map((item) => (
                                            <tr key={item.id} className="asset-row" style={{ borderBottom: `1.5px solid ${T.bg}`, transition: '0.2s', background: '#fff' }}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                                            <Wrench size={22} strokeWidth={2.5} />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{item.name}</span>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>{item.location}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{item.brand} {item.model}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>SN: {item.serialNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: 8, background: T.bg, color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{item.category}</span>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
                                                        borderRadius: 20, background: item.status === 'Operational' ? T.greenLight : item.status === 'In Maintenance' ? T.amberLight : T.roseLight,
                                                        color: item.status === 'Operational' ? T.green : item.status === 'In Maintenance' ? T.amber : T.rose
                                                    }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor' }} />
                                                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{item.status}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.lastService ? new Date(item.lastService).toLocaleDateString() : 'No History'}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>Next: {item.nextService ? new Date(item.nextService).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        <button style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                                    <Archive size={64} style={{ color: T.bg, marginBottom: 20 }} />
                                                    <h4 style={{ fontSize: 18, fontWeight: 900, color: T.subtle }}>No Equipment Found</h4>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: T.bg }}>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Equipment</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Issue Description</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Incurred Cost</th>
                                            <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Log</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenanceLogs.length > 0 ? maintenanceLogs.map((log) => (
                                            <tr key={log.id} className="asset-row" style={{ borderBottom: `1.5px solid ${T.bg}`, transition: '0.2s', background: '#fff' }}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{log.equipment?.name}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>{log.equipment?.serialNumber}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{log.issue}</span>
                                                        <span style={{ fontSize: 11, fontWeight: 500, color: T.muted, lineHeight: 1.4 }}>{log.description}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{ 
                                                        padding: '4px 10px', borderRadius: 8, 
                                                        background: log.priority === 'High' || log.priority === 'Critical' ? T.roseLight : T.bg, 
                                                        color: log.priority === 'High' || log.priority === 'Critical' ? T.rose : T.muted, 
                                                        fontSize: 10, fontWeight: 900, textTransform: 'uppercase' 
                                                    }}>
                                                        {log.priority}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
                                                        borderRadius: 20, background: log.status === 'Completed' ? T.greenLight : T.amberLight,
                                                        color: log.status === 'Completed' ? T.green : T.amber
                                                    }}>
                                                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{log.status}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 900, color: T.text }}>
                                                    ₹{Number(log.cost || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <button style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                                    <History size={64} style={{ color: T.bg, marginBottom: 20 }} />
                                                    <h4 style={{ fontSize: 18, fontWeight: 900, color: T.subtle }}>No Maintenance History</h4>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddEquipmentDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onAdd={handleAddEquipment}
            />
        </div>
    );
};

export default EquipmentListPage;
