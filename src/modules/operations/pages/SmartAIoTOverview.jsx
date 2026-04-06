import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Smartphone,
    ShieldCheck,
    Users,
    XCircle,
    LayoutGrid,
    Clock,
    ArrowRight,
    RefreshCw,
    Building
} from 'lucide-react';
import { fetchGymDeviceDashboard } from '../../../api/gymDeviceApi';
import { useAuth } from '../../../context/AuthContext';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';

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
  teal: '#14B8A6',
  tealLight: '#F0FDFA',
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF',
  orange: '#F59E0B',
  orangeLight: '#FFFBEB'
};

const StatCard = ({ label, value, color, icon: Icon }) => {
    const [hover, setHover] = useState(false);
    
    // Map of colors to T tokens
    const cMap = {
        emerald: { bg: T.greenLight, text: T.green, border: T.green + '20' },
        red: { bg: T.roseLight, text: T.rose, border: T.rose + '20' },
        violet: { bg: T.accentLight, text: T.accent, border: T.accent + '20' },
        blue: { bg: T.blueLight, text: T.blue, border: T.blue + '20' },
        amber: { bg: T.amberLight, text: T.amber, border: T.amber + '20' },
        orange: { bg: T.orangeLight, text: T.orange, border: T.orange + '20' },
        cyan: { bg: T.cyanLight, text: T.cyan, border: T.cyan + '20' },
        teal: { bg: T.tealLight, text: T.teal, border: T.teal + '20' },
    };
    
    const s = cMap[color] || cMap.violet;

    return (
        <div 
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '18px 12px', borderRadius: '18px', background: T.surface,
                border: `1px solid ${hover ? s.text : T.border}`, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default', transform: hover ? 'translateY(-4px)' : 'none',
                boxShadow: hover ? `0 12px 24px ${s.text}15` : '0 2px 8px rgba(124,92,252,0.04)',
                flex: 1, minWidth: 120
            }}
        >
            <div style={{ 
                width: 36, height: 36, borderRadius: 10, background: s.bg, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                color: s.text
            }}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, lineHeight: 1.2 }}>{value}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginTop: 4 }}>{label}</div>
        </div>
    );
};

const SmartAIoTOverview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchAllGyms()
                .then(data => setBranches(data.gyms || data || []))
                .catch(() => {});
        }
    }, [isSuperAdmin]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchId = isSuperAdmin ? (selectedBranchId || null) : null;
            const data = await fetchGymDeviceDashboard(branchId);
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch SmartAIoT data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedBranchId]);

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', gap: 28, 
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: 'fadeUp 0.5s ease-out' 
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
                .grid-table { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr 1.2fr 0.8fr; align-items: center; }
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 768px) {
                    .header-top { flex-direction: column !important; align-items: flex-start !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>

            {/* Header */}
            <div className="header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                        width: 52, height: 52, borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#fff', boxShadow: `0 8px 16px ${T.accent}30`
                    }}>
                        <ShieldCheck size={28} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            Smart AIoT Overview
                            {loading && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, animation: 'ping 1s infinite' }}></div>}
                        </h1>
                        <p style={{ fontSize: 11, color: T.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '4px 0 0' }}>Real-time Face Recognition Hardware Sync</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    {isSuperAdmin && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 8, px: 14, py: 8, 
                            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                            padding: '8px 14px'
                        }}>
                            <Building size={14} color={T.subtle} />
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                style={{ fontSize: 13, fontWeight: 700, color: T.text, background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.branchName || b.gymName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', 
                            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                            fontSize: 13, fontWeight: 800, color: T.muted, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: '0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                    >
                        <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/operations/devices')}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', 
                            background: T.accent, border: 'none', borderRadius: 12,
                            fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
                            transition: '0.2s', boxShadow: `0 4px 12px ${T.accent}30`
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.accent2; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'none'; }}
                    >
                        Hardware Settings <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
                <StatCard label="Online" value={summary?.onlineCount ?? 0} color="emerald" icon={ShieldCheck} />
                <StatCard label="Offline" value={summary?.offlineCount ?? 0} color="red" icon={XCircle} />
                <StatCard label="Members Today" value={summary?.totalCountToday ?? 0} color="violet" icon={Users} />
                <StatCard label="Members Total" value={summary?.totalCountAll ?? 0} color="blue" icon={LayoutGrid} />
                <StatCard label="Staff Today" value={summary?.employeeCountToday ?? 0} color="amber" icon={Users} />
                <StatCard label="Staff Total" value={summary?.employeeCountAll ?? 0} color="orange" icon={LayoutGrid} />
                <StatCard label="Visitors Today" value={summary?.visitorCountToday ?? 0} color="cyan" icon={Users} />
                <StatCard label="Visitors Total" value={summary?.visitorCountAll ?? 0} color="teal" icon={LayoutGrid} />
            </div>

            {/* Recent Face Access Logs */}
            <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(124,92,252,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={16} color={T.accent} strokeWidth={2.5} />
                        Recent Face Access Logs
                    </h4>
                    <button
                        onClick={() => navigate('/operations/face-records')}
                        style={{ fontSize: 11, fontWeight: 900, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                        View Detailed Logs
                    </button>
                </div>
                <div className="table-wrapper">
                    <div className="table-content">
                        {/* Header */}
                        <div style={{ padding: '14px 28px', background: T.bg }} className="grid-table">
                            {['Person', 'ID / SN', 'Type', 'Device', 'Time', 'Status'].map(h => (
                                <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                            ))}
                        </div>
                        {/* Body */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {summary?.records?.slice(0, 10).map((record, idx) => (
                                <div 
                                    key={record.id} 
                                    style={{ 
                                        padding: '16px 28px', 
                                        borderBottom: idx === 9 ? 'none' : `1px solid ${T.bg}`,
                                        transition: 'background 0.2s',
                                        cursor: 'default'
                                    }}
                                    className="grid-table row-hover"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: '50%', background: T.bg, 
                                            overflow: 'hidden', border: `2px solid #fff`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                                        }}>
                                            {record.imageUrl ? (
                                                <img src={record.imageUrl} alt={record.personName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                                    <Users size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{record.personName}</div>
                                    </div>
                                    
                                    <div>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: 8, background: T.bg, 
                                            color: T.muted, fontSize: 11, fontWeight: 700 
                                        }}>
                                            #{record.personSn}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }}></div>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{record.passType?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: 11, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{record.deviceName}</div>
                                    
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                                            {new Date(record.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: 10, color: T.subtle, fontWeight: 600 }}>{new Date(record.createTime).toLocaleDateString()}</div>
                                    </div>
                                    
                                    <div>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 8, background: T.greenLight, 
                                            color: T.green, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' 
                                        }}>
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            )) || (
                                <div style={{ padding: '60px 20px', textAlign: 'center', color: T.subtle, fontSize: 13, fontWeight: 700 }}>
                                    No recent face access records found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartAIoTOverview;
