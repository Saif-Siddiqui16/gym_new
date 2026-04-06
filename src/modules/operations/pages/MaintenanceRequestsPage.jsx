import React, { useState, useEffect } from 'react';
import { TICKET_STATUSES, SEVERITIES } from '../data/maintenanceData';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import {
    Wrench,
    Clock,
    AlertCircle,
    CheckCircle2,
    User,
    Calendar,
    ChevronRight,
    Filter,
    ArrowUpRight,
    AlertTriangle,
    Search,
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

const MaintenanceRequestsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

    const tabs = ['All', 'Open', 'In Progress', 'Completed', 'Critical'];

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (activeTab !== 'All') {
                if (activeTab === 'Critical') filters.priority = 'Critical';
                else filters.status = activeTab;
            }

            const data = await equipmentApi.getMaintenanceRequests(filters);
            setTickets(data || []);
        } catch (error) {
            console.error("Failed to fetch maintenance requests:", error);
            toast.error("Failed to load maintenance tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await equipmentApi.updateMaintenanceStatus(id, newStatus);
            toast.success("Ticket status updated");
            fetchTickets();
        } catch (error) {
            toast.error("Failed to update ticket status");
        }
    };

    const getSeverityStyle = (sev) => {
        switch (sev) {
            case 'Critical': return { bg: T.roseLight, color: T.rose };
            case 'High': return { bg: T.amberLight, color: T.amber };
            case 'Medium': return { bg: T.blueLight, color: T.blue };
            default: return { bg: T.indigoLight, color: T.indigo };
        }
    };

    const getStatusConfig = (status) => {
        return TICKET_STATUSES.find(s => s.label === status) || TICKET_STATUSES[0];
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
                .ticket-row:hover { background: ${T.bg} !important; }
                .ticket-row:hover td { color: ${T.text} !important; }
            `}</style>

            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${T.amber}, ${T.rose})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.3)' }}>
                        <Wrench size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Service Tickets</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Monitor equipment health and manage maintenance lifecycles</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            placeholder="Find machine or ticket ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', height: 52, padding: '0 16px 0 48px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s' }}
                        />
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff`, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.amber }}>
                        <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Active Requests Catalog</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg + '50' }}>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Ticket ID</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Equipment</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Priority</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Reported Info</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                        <Clock size={40} color={T.amber} style={{ animation: 'spin 2s linear infinite' }} />
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 80, height: 80, borderRadius: 30, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <p style={{ fontSize: 15, fontWeight: 700, color: T.muted }}>System clear. No pending maintenance.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => {
                                    const sev = getSeverityStyle(ticket.priority);
                                    const st = getStatusConfig(ticket.status);
                                    return (
                                        <tr 
                                            key={ticket.id} 
                                            className="ticket-row" 
                                            style={{ borderBottom: `1.2px solid ${T.bg}`, transition: '0.2s', cursor: 'pointer' }}
                                            onClick={() => { setSelectedTicket(ticket); setIsDetailDrawerOpen(true); }}
                                        >
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: 13, fontWeight: 900, color: T.text, fontStyle: 'italic' }}>#T-{ticket.id}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                                        <Box size={18} />
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{ticket.equipment?.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: sev.bg, color: sev.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sev.color }} />
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Staff Registry</div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 10, background: T.bg, color: T.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: `1.2px solid ${T.border}` }}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={ticket.status}
                                                    onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                                    style={{ height: 36, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 11, fontWeight: 800, color: T.text, outline: 'none', cursor: 'pointer', background: '#fff' }}
                                                >
                                                    {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                isOpen={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                title={`Ticket #T-${selectedTicket?.id}`}
            >
                {selectedTicket && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ background: T.bg, padding: 24, borderRadius: 28, border: `1.5px solid ${T.border}` }}>
                            <h4 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Issue Narrative</h4>
                            <p style={{ margin: '12px 0 0', fontSize: 15, color: T.text, fontWeight: 600, lineHeight: 1.6 }}>{selectedTicket.issue}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ background: '#fff', padding: 20, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Machine Identification</span>
                                <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 800, color: T.text }}>{selectedTicket.equipment?.name}</p>
                            </div>
                            <div style={{ background: '#fff', padding: 20, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Assigned Protocol</span>
                                <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 800, color: getSeverityStyle(selectedTicket.priority).color }}>{selectedTicket.priority}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <User size={16} color={T.accent} /> Technician Lifecycle
                            </h4>
                            <div style={{ background: T.accentLight, padding: 20, borderRadius: 24, border: `1.5px solid ${T.accent}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, border: `2px solid ${T.accent}` }}>
                                        {selectedTicket.assignedTo?.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.accent, textTransform: 'uppercase' }}>Active Assignee</p>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text }}>{selectedTicket.assignedTo}</p>
                                    </div>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: T.accent, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>Reassign</button>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                            <ActionButton style={{ flex: 1 }} icon={MoreHorizontal} onClick={() => setIsDetailDrawerOpen(false)}>Update Lifecycle</ActionButton>
                            <button 
                                onClick={() => setIsDetailDrawerOpen(false)}
                                style={{ width: 60, height: 60, borderRadius: 16, background: '#fff', border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, cursor: 'pointer' }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default MaintenanceRequestsPage;
