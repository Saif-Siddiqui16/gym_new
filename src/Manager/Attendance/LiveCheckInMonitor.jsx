import React, { useState, useEffect } from 'react';
import { Clock, Users, Activity, Loader2, PlayCircle, RefreshCw, Smartphone, ShieldCheck, MapPin, Search } from 'lucide-react';
import { getCheckIns, getAttendanceStats } from '../../api/manager/managerApi';

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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.2)',
  cardShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.08)'
};

const LiveCheckInMonitor = () => {
    const [checkIns, setCheckIns] = useState([]);
    const [stats, setStats] = useState({ currentlyIn: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async (manual = false) => {
        if (manual) setRefreshing(true);
        try {
            const [checkInData, statData] = await Promise.all([
                getCheckIns({ limit: 20 }),
                getAttendanceStats()
            ]);
            setCheckIns(checkInData?.data || []);
            setStats(statData || { currentlyIn: 0 });
        } catch (error) {
            console.error('Data retrieval failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusBadge = (status) => {
        const isCheckedIn = status === 'checked-in' || status === 'Present';
        return (
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 12,
                background: isCheckedIn ? T.greenLight : T.bg, 
                color: isCheckedIn ? T.green : T.muted,
                border: `1.5px solid ${isCheckedIn ? T.green + '20' : T.border}`,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
                {isCheckedIn ? (
                    <div style={{ position: 'relative', width: 6, height: 6 }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: T.green, animation: 'ping 1.5s infinite opacity-0' }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                    </div>
                ) : <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.subtle }} />}
                {isCheckedIn ? 'Currently In' : 'Logged Out'}
            </div>
        );
    };

    return (
        <div style={{ padding: '32px 40px', background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
                .live-card:hover { transform: translateY(-4px); box-shadow: ${T.shadow}; border-color: ${T.accentLight} !important; }
                .activity-row { transition: 0.3s; }
                .activity-row:hover { background: ${T.bg} !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${T.accentMid}; borderRadius: 10px; }
            `}</style>

            {/* Premium Meta Header */}
            <div style={{ marginBottom: 40, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 22, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.4)', position: 'relative' }}>
                             <Activity size={32} strokeWidth={2.5} />
                             <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: T.green, border: '3px solid #fff' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <h1 style={{ fontSize: 36, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.03em' }}>Live Monitor</h1>
                                <span style={{ padding: '4px 10px', background: 'linear-gradient(135deg, #FFD700, #F59E0B)', color: '#fff', fontSize: 10, fontWeight: 900, borderRadius: 8, textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' }}>Premium Node</span>
                            </div>
                            <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', color: T.accent }} />
                                Real-time diagnostic stream of facility entries
                            </p>
                        </div>
                    </div>

                    {/* KPI Pulse */}
                    <div className="live-card" style={{ background: '#fff', padding: '16px 28px', borderRadius: 24, border: `2px solid transparent`, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 24, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }}>
                         <div style={{ width: 52, height: 52, borderRadius: 16, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.green }}>
                             <Users size={24} strokeWidth={2.5} />
                         </div>
                         <div>
                             <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Occupancy</p>
                             <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                 <h2 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0 }}>{stats.currentlyIn}</h2>
                                 <span style={{ fontSize: 12, fontWeight: 800, color: T.green }}>Live Now</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Latest Feed Terminal */}
            <div style={{ background: '#fff', borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FBFBFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                             <Clock size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                             <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Transaction Feed</h3>
                             <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent system activity</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: T.bg, borderRadius: 14, color: T.green, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                             <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'ping 2s infinite' }} />
                             Sensors Active
                        </div>
                        <button 
                            onClick={() => loadData(manual=true)}
                            style={{ height: 40, padding: '0 16px', borderRadius: 12, border: `2.2px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        >
                            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            Force Refresh
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead style={{ background: T.bg }}>
                            <tr>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Identity</th>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Classification</th>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</th>
                                <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Node</th>
                                <th style={{ padding: '20px 32px', textAlign: 'right', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Action Cache</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 120, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <Loader2 size={48} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                                            <p style={{ fontSize: 12, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Initializing Live Stream</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : checkIns.length > 0 ? (
                                checkIns.map((log, i) => (
                                    <tr key={log.id} className="activity-row" style={{ borderBottom: `1px solid ${T.bg}`, animation: `slideIn 0.4s ease-out backwards ${i * 0.05}s` }}>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: T.accent, overflow: 'hidden' }}>
                                                    {log.avatar ? <img src={log.avatar} alt={log.name} style={{ width: '100%', height: '100%', objectCover: 'cover' }} /> : (log.name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text }}>{log.name}</p>
                                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: T.subtle }}>ID: #{log.id.toString().slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8,
                                                background: log.type === 'Member' ? T.accentLight : log.type === 'Staff' ? T.indigoLight : T.amberLight,
                                                color: log.type === 'Member' ? T.accent : log.type === 'Staff' ? T.accent : T.amber,
                                                fontSize: 10, fontWeight: 900, textTransform: 'uppercase'
                                            }}>
                                                {log.type === 'Member' ? <Smartphone size={10} /> : <ShieldCheck size={10} />}
                                                {log.type}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.text, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                                                <Clock size={14} color={T.subtle} />
                                                {log.time}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted, fontSize: 12, fontWeight: 600 }}>
                                                <MapPin size={14} color={T.subtle} />
                                                Main Entry A-04
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                            {getStatusBadge(log.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: 100, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                                             <PlayCircle size={60} color={T.subtle} strokeWidth={1} />
                                             <h4 style={{ fontSize: 18, fontWeight: 900, color: T.muted, margin: 0 }}>Silence Detected</h4>
                                             <p style={{ fontSize: 13, fontWeight: 500, color: T.subtle, margin: 0 }}>No facility entries recorded for the current cycle.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Visual Metadata Footer */}
                {!loading && checkIns.length > 0 && (
                    <div style={{ padding: '16px 32px', background: T.bg + '40', borderTop: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>End of Stream - Polling Live...</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: T.accent, opacity: 1 - (i*0.2) }} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveCheckInMonitor;
