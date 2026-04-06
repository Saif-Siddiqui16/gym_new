import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Users, Search, Calendar, Filter, Download, ArrowLeft, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFaceAccessRecords, fetchGymDepartments } from '../../../api/gymDeviceApi';
import { useBranchContext } from '../../../context/BranchContext';

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

const FaceAccessRecords = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [records, setRecords] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const loadData = async () => {
        setLoading(true);
        try {
            const branchId = selectedBranch && selectedBranch !== 'all' ? selectedBranch : null;
            const [recordsData, deptsData] = await Promise.all([
                fetchFaceAccessRecords(branchId),
                fetchGymDepartments(branchId).catch(() => [])
            ]);
            setRecords(recordsData || []);
            setDepartments(deptsData || []);
        } catch (error) {
            console.error("Failed to load access records", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        if (!r) return false;
        const name = (r.personName || '').toLowerCase();
        const sn = (r.personSn || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || name.includes(search) || sn.includes(search);
        const matchesDate = !dateFilter || (r.createTime && r.createTime.startsWith(dateFilter));
        return matchesSearch && matchesDate;
    });

    const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, style = {} }) => (
        <button
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{
                height: 44, padding: '0 20px', borderRadius: 12, border: variant === 'outline' ? `1.5px solid ${T.border}` : 'none',
                background: variant === 'outline' ? '#fff' : T.accent, color: variant === 'outline' ? T.text : '#fff',
                fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', ...style
            }}
        >
            {Icon && <Icon size={16} strokeWidth={2.5} />}
            {children}
        </button>
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .record-row:hover { background: ${T.accentLight}50 !important; cursor: pointer; }
                input::placeholder, select::placeholder { color: ${T.subtle}; opacity: 1; }
                .pulse-green { width: 6px; height: 6px; border-radius: 50%; background: ${T.green}; box-shadow: 0 0 0 0 ${T.green}40; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${T.green}70; } 70% { transform: scale(1); box-shadow: 0 0 0 10px ${T.green}00; } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${T.green}00; } }
            `}</style>

            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button 
                        onClick={() => navigate(-1)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        style={{ 
                            width: 48, height: 48, borderRadius: 16, border: `1.5px solid ${T.border}`,
                            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: T.muted, transition: '0.2s', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Face Access Records</h1>
                            <div style={{ padding: '4px 12px', background: T.accentLight, borderRadius: 20, color: T.accent, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                AIoT Live
                            </div>
                        </div>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Monitor real-time biometric entry logs for all members.</p>
                    </div>
                </div>
                <ActionButton icon={Download}>Export Data</ActionButton>
            </div>

            {/* Stats Cards Row (Optional but makes it feel premium) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                {[
                    { label: 'Today Entries', value: filteredRecords.length, icon: Users, color: T.accent, bg: T.accentLight },
                    { label: 'Last Registry', value: filteredRecords[0]?.createTime || 'N/A', icon: Clock, color: T.blue, bg: T.blueLight },
                    { label: 'Network Status', value: 'Operational', icon: ShieldCheck, color: T.green, bg: T.greenLight },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 24, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h4 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, color: T.text }}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : (i === 1 && stat.value !== 'N/A' ? stat.value.split(' ')[1] : stat.value)}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ background: '#1A1533', padding: 20, borderRadius: 24, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', animation: 'fadeIn 0.7s ease-out', boxShadow: '0 20px 40px rgba(26, 21, 51, 0.2)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, ID or SN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: 52, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '0 20px 0 52px', color: '#fff', fontSize: 13, fontWeight: 500, outline: 'none', transition: '0.2s' }}
                    />
                </div>
                <div style={{ width: 220, position: 'relative' }}>
                    <Calendar style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={18} />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ width: '100%', height: 52, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '0 20px 0 52px', color: '#fff', fontSize: 13, fontWeight: 500, outline: 'none' }}
                    />
                </div>
                <ActionButton onClick={loadData} variant="outline" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }} icon={RefreshCw}>Refresh</ActionButton>
            </div>

            {/* Records Table */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.8s ease-out' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Details</th>
                                <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identification</th>
                                <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hardware Location</th>
                                <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Info</th>
                                <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Outcome</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan="5" style={{ padding: '24px 32px' }}><div style={{ height: 60, background: T.bg, borderRadius: 16, animation: 'pulse 1.5s infinite ease-in-out' }} /></td></tr>
                                ))
                            ) : filteredRecords.map((record) => (
                                <tr key={record.id} className="record-row" style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.2s' }}>
                                    <td style={{ padding: '16px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 14, background: T.bg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.border}` }}>
                                                {record.imageUrl ? (
                                                    <img src={record.imageUrl} alt={record.personName} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                                                ) : (
                                                    <ImageIcon size={20} color={T.subtle} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{record.personName || 'Unregistered Guest'}</div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase' }}>{record.personName ? 'Member' : 'Visitor'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 32px' }}>
                                        <div style={{ display: 'inline-flex', padding: '6px 12px', background: record.personSn ? T.accentLight : T.bg, borderRadius: 10, border: `1px solid ${record.personSn ? T.accentMid : T.border}` }}>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: record.personSn ? T.accent : T.muted, fontFamily: 'monospace' }}>{record.personSn || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <ShieldCheck size={14} color={T.accent} />
                                            <span style={{ fontSize: 12, fontWeight: 800, color: T.text, textTransform: 'uppercase' }}>{record.deviceName}</span>
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, marginTop: 2 }}>SN: {record.deviceKey}</div>
                                    </td>
                                    <td style={{ padding: '16px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: T.text }}>
                                            <Clock size={14} color={T.muted} />
                                            {new Date(record.createTime.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginTop: 2 }}>{new Date(record.createTime.replace(' ', 'T')).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                                    </td>
                                    <td style={{ padding: '16px 32px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: T.greenLight, borderRadius: 20, border: `1px solid ${T.green}20` }}>
                                            <div className="pulse-green" />
                                            <span style={{ fontSize: 10, fontWeight: 900, color: T.green, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Granted</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredRecords.length === 0 && (
                    <div style={{ padding: '80px 32px', textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: T.subtle }}>
                            <Search size={32} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>No Access Logs Found</h3>
                        <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 8 }}>We couldn't find any biometric records matching your criteria.</p>
                        <button onClick={() => { setSearchTerm(''); setDateFilter(''); }} style={{ marginTop: 24, background: 'none', border: 'none', color: T.accent, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>Clear All Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceAccessRecords;
