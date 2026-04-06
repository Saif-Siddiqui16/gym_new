import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Smartphone,
    ShieldCheck,
    Users as UsersIcon,
    XCircle,
    LayoutGrid,
    Clock as ClockIcon,
    ArrowRight
} from 'lucide-react';
import { fetchGymDeviceDashboard } from '../../../api/gymDeviceApi';
import { useBranchContext } from '../../../context/BranchContext';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────────── */
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
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF',
  teal: '#14B8A6',
  tealLight: '#F0FDFA',
  orange: '#F97316',
  orangeLight: '#FFF7ED'
};

const DeviceStatCard = ({ label, value, color, icon: Icon }) => {
    const [hover, setHover] = useState(false);
    const colorMap = {
        emerald: { bg: T.greenLight, text: T.green, border: '#A7F3D0' },
        red: { bg: T.roseLight, text: T.rose, border: '#FECDD3' },
        violet: { bg: T.accentLight, text: T.accent, border: T.accentMid },
        blue: { bg: T.blueLight, text: T.blue, border: '#BFDBFE' },
        amber: { bg: T.amberLight, text: T.amber, border: '#FDE68A' },
        orange: { bg: T.orangeLight, text: T.orange, border: '#FED7AA' },
        cyan: { bg: T.cyanLight, text: T.cyan, border: '#A5F3FC' },
        teal: { bg: T.tealLight, text: T.teal, border: '#99F6E4' }
    };
    const c = colorMap[color] || colorMap.violet;

    return (
        <div 
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '16px 12px', borderRadius: 20, border: `1px solid ${c.border}`,
                background: c.bg, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default', transform: hover ? 'scale(1.05)' : 'scale(1)',
                boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.06)' : 'none'
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <Icon size={16} style={{ marginBottom: 8, opacity: hover ? 1 : 0.5, color: c.text, transition: '0.2s' }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: c.text, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 8, fontWeight: 900, color: c.text, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginTop: 4 }}>{label}</div>
        </div>
    );
};

const SmartAIoTSummary = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch && selectedBranch !== 'all' ? selectedBranch : null;
            const data = await fetchGymDeviceDashboard(branchId);
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch smart device data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedBranch]);

    if (!summary && !loading) return null;

    return (
        <div style={{
            marginBottom: 32, padding: 24, background: 'rgba(124, 92, 252, 0.03)',
            borderRadius: 30, border: `2px dashed ${T.accentMid}`,
            position: 'relative', overflow: 'hidden'
        }}>
            <style>{`
                @keyframes pulseAccent { 0%, 100% { opacity: 0.4; transform: scale(1) } 50% { opacity: 1; transform: scale(1.5) } }
                .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.accent}; animation: pulseAccent 2s ease-in-out infinite; }
            `}</style>
            
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.05, pointerEvents: 'none' }}>
                <Smartphone size={120} style={{ transform: 'rotate(12deg)' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 30, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', boxShadow: `0 8px 24px rgba(124,92,252,0.25)`
                    }}>
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1A1533', margin: 0, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.3px' }}>
                            Smart AIoT Access Control
                            {loading && <div className="pulse-dot"></div>}
                        </h3>
                        <p style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '4px 0 0' }}>Real-time Face Recognition Hardware Sync</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/operations/devices')}
                    style={{
                        fontSize: 10, fontWeight: 900, color: T.accent, background: '#fff',
                        padding: '10px 20px', borderRadius: 12, border: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.08em', transition: '0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)', width: 'fit-content'
                    }}
                    onMouseOver={e => { e.currentTarget.style.border = `1px solid ${T.accentMid}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.border = `1px solid ${T.border}`; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    Hardware Settings <ArrowRight size={12} />
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14, marginBottom: 30 }}>
                <DeviceStatCard label="Online" value={summary?.onlineCount || 0} color="emerald" icon={ShieldCheck} />
                <DeviceStatCard label="Offline" value={summary?.offlineCount || 0} color="red" icon={XCircle} />
                <DeviceStatCard label="Face Today" value={summary?.totalCountToday || 0} color="violet" icon={UsersIcon} />
                <DeviceStatCard label="Face Total" value={summary?.totalCountAll || 0} color="blue" icon={LayoutGrid} />
                <DeviceStatCard label="Staff Today" value={summary?.employeeCountToday || 0} color="amber" icon={UsersIcon} />
                <DeviceStatCard label="Staff Total" value={summary?.employeeCountAll || 0} color="orange" icon={LayoutGrid} />
                <DeviceStatCard label="Visitors Today" value={summary?.visitorCountToday || 0} color="cyan" icon={UsersIcon} />
                <DeviceStatCard label="Visitors Total" value={summary?.visitorCountAll || 0} color="teal" icon={LayoutGrid} />
            </div>

            {/* Recent Face Records */}
            <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.8)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: 11, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockIcon size={14} color={T.accent} />
                        Recent Face Access Logs
                    </h4>
                    <button 
                        onClick={() => navigate('/operations/face-records')}
                        style={{ fontSize: 10, fontWeight: 900, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        View Detailed Logs
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                {['Person', 'ID / SN', 'Type', 'Device', 'Time', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ divide: `1px solid ${T.border}` }}>
                            {summary?.records?.slice(0, 5).map((record, i) => (
                                <tr key={record.id} style={{ borderTop: `1px solid ${T.bg}`, transition: '0.2s' }}>
                                    <td style={{ padding: '10px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', background: T.bg, flexShrink: 0 }}>
                                                {record.imageUrl ? (
                                                    <img src={record.imageUrl} alt={record.personName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                                        <UsersIcon size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 900, color: T.text }}>{record.personName}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 24px' }}>
                                        <span style={{ padding: '4px 8px', background: T.bg, color: T.muted, fontSize: 10, fontWeight: 800, borderRadius: 8 }}>{record.personSn}</span>
                                    </td>
                                    <td style={{ padding: '10px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                                            <span style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{record.passType.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 24px', fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{record.deviceName}</td>
                                    <td style={{ padding: '10px 24px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: T.text }}>{new Date(record.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div style={{ fontSize: 8, fontWeight: 700, color: T.subtle }}>{new Date(record.createTime).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '10px 24px' }}>
                                        <span style={{ padding: '4px 10px', background: T.greenLight, color: T.green, fontSize: 9, fontWeight: 900, borderRadius: 6, textTransform: 'uppercase' }}>Verified</span>
                                    </td>
                                </tr>
                            )) || (
                                <tr>
                                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: T.subtle, fontSize: 12, fontWeight: 800, fontStyle: 'italic' }}>No recent records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SmartAIoTSummary;
