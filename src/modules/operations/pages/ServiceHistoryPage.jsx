import React, { useState, useEffect } from 'react';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import {
    History,
    Wrench,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Search,
    Calendar,
    Package,
    ArrowUpRight,
    Filter,
    ChevronRight,
    XCircle,
    MoreHorizontal,
    Box
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

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

const ServiceHistoryPage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const tabs = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

    useEffect(() => {
        fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (activeTab !== 'All') {
                filters.status = activeTab;
            }
            const data = await equipmentApi.getMaintenanceRequests(filters);
            setRecords(data || []);
        } catch (error) {
            console.error("Failed to fetch service history:", error);
            toast.error("Failed to load service history");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await equipmentApi.updateMaintenanceStatus(id, newStatus);
            toast.success("Status updated successfully");
            fetchHistory();
            if (selectedRecord?.id === id) {
                setSelectedRecord(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredRecords = records.filter(r => {
        const equipName = r.equipment?.name?.toLowerCase() || '';
        const issue = r.issue?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return equipName.includes(term) || issue.includes(term) || `#T-${r.id}`.toLowerCase().includes(term);
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return { bg: T.greenLight, color: T.green, icon: CheckCircle2 };
            case 'In Progress': return { bg: T.amberLight, color: T.amber, icon: Clock };
            case 'Cancelled': return { bg: T.roseLight, color: T.rose, icon: XCircle };
            case 'Pending': return { bg: T.accentLight, color: T.accent, icon: Clock };
            default: return { bg: '#F1F5F9', color: '#64748B', icon: Clock };
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Critical': return { bg: T.roseLight, color: T.rose };
            case 'High': return { bg: T.amberLight, color: T.amber };
            case 'Medium': return { bg: T.blueLight, color: T.blue };
            case 'Low': return { bg: T.greenLight, color: T.green };
            default: return { bg: T.indigoLight, color: T.indigo };
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

    const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: 24, boxShadow: T.cardShadow, border: `1.5px solid #fff`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <h3 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 900, color: T.text }}>{value}</h3>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .history-row:hover { background: ${T.bg} !important; }
                .history-row:hover td { color: ${T.text} !important; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${T.green}, ${T.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 30px -10px rgba(34, 201, 122, 0.3)' }}>
                        <History size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Service Archive</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Comprehensive logs and equipment maintenance history</p>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <StatCard label="Total Records" value={records.length} icon={History} color={T.indigo} />
                <StatCard label="Completed Tasks" value={records.filter(r => r.status === 'Completed').length} icon={CheckCircle2} color={T.green} />
                <StatCard label="In Progress" value={records.filter(r => r.status === 'In Progress').length} icon={Clock} color={T.amber} />
                <StatCard label="Pending" value={records.filter(r => r.status === 'Pending').length} icon={Clock} color={T.accent} />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <div style={{ display: 'flex', background: '#fff', padding: 6, borderRadius: 20, boxShadow: T.cardShadow, border: `1.5px solid #fff` }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 24px', borderRadius: 14, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', cursor: 'pointer', transition: '0.3s',
                                background: activeTab === tab ? T.accent : 'transparent',
                                color: activeTab === tab ? '#fff' : T.muted,
                                boxShadow: activeTab === tab ? T.shadow : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', width: 340 }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <input
                        type="text"
                        placeholder="Search machines or tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: 52, padding: '0 16px 0 48px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s' }}
                    />
                </div>
            </div>

            {/* History Table */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff`, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.indigo }}>
                        <Box size={20} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Maintenance Ledger</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg + '50' }}>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Ticket</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Equipment Info</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Service Issue</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Priority</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Lifecycle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: 100, textAlign: 'center' }}><Clock size={40} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} /></td></tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: 100, textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}><div style={{ width: 80, height: 80, borderRadius: 30, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><History size={32} /></div><p style={{ fontSize: 15, fontWeight: 700, color: T.muted }}>No service records in archive.</p></div></td></tr>
                            ) : (
                                filteredRecords.map((item) => {
                                    const st = getStatusStyle(item.status);
                                    const sev = getPriorityStyle(item.priority);
                                    return (
                                        <tr 
                                            key={item.id} 
                                            className="history-row" 
                                            style={{ borderBottom: `1.2px solid ${T.bg}`, transition: '0.2s', cursor: 'pointer' }}
                                            onClick={() => setSelectedRecord(item)}
                                        >
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: 13, fontWeight: 900, color: T.text, fontStyle: 'italic' }}>#T-{item.id}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{item.equipment?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{item.equipment?.category || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <p style={{ margin: 0, fontSize: 14, color: T.muted, fontWeight: 500, maxWidth: 200, truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.issue}</p>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: sev.bg, color: sev.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sev.color }} />
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: st.bg, color: st.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: `1.2px solid ${st.color}20` }}>
                                                    <st.icon size={12} strokeWidth={3} />
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                                    style={{ height: 36, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 11, fontWeight: 800, color: T.text, outline: 'none', cursor: 'pointer', background: '#fff' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Drawer */}
            <RightDrawer
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                title={selectedRecord ? `Service Record #T-${selectedRecord.id}` : ''}
            >
                {selectedRecord && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ background: T.bg, padding: 24, borderRadius: 28, border: `1.5px solid ${T.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <h4 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Reported Problem</h4>
                                <span style={{ fontSize: 11, fontWeight: 900, color: T.accent, textTransform: 'uppercase' }}>Verified Issue</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 16, color: T.text, fontWeight: 600, lineHeight: 1.6 }}>{selectedRecord.issue}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ background: '#fff', padding: 20, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Machine Name</span>
                                <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.name || 'N/A'}</p>
                            </div>
                            <div style={{ background: '#fff', padding: 20, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Equipment Class</span>
                                <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.category || 'N/A'}</p>
                            </div>
                        </div>

                        <div style={{ background: T.greenLight, padding: 24, borderRadius: 28, border: `1.5px solid ${T.green}20`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.green, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Package size={16} /> Asset Intelligence
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.green }}>Serial Trace</p><p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.serialNumber || 'N/A'}</p></div>
                                <div><p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.green }}>Current Loc</p><p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.location || 'Floor A'}</p></div>
                                <div><p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.green }}>Manufacturer</p><p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.brand || 'Premium Fitness'}</p></div>
                                <div><p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.green }}>Global Status</p><p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text }}>{selectedRecord.equipment?.status || 'Active'}</p></div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.text }}>Status Lifecycle</h4>
                            <select
                                value={selectedRecord.status}
                                onChange={(e) => handleStatusUpdate(selectedRecord.id, e.target.value)}
                                style={{ width: '100%', height: 52, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`, fontSize: 14, fontWeight: 800, color: T.text, background: '#fff', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <ActionButton style={{ width: '100%' }} icon={XCircle} onClick={() => setSelectedRecord(null)}>Close Ledger Entry</ActionButton>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default ServiceHistoryPage;
