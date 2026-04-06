import React, { useState, useEffect } from 'react';
import {
    Clock, Shield, User, XCircle, History, Calendar, LayoutDashboard,
    UserCheck, Users, LogIn, LogOut, CheckCircle2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';

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

const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, padding: 24, borderRadius: 28, border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover ? '0 12px 30px rgba(124,92,252,0.12)' : '0 2px 14px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>{subtitle}</div>
                </div>
            </div>
        </div>
    );
};

const TrainerAttendance = () => {
    const [attendanceData, setAttendanceData] = useState({
        logs: [],
        activeShift: null,
        stats: {
            currentlyWorking: 0,
            todayCheckIns: 0,
            completedShifts: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [meResponse, liveResponse] = await Promise.all([
                apiClient.get('/staff/attendance/me'),
                apiClient.get('/admin/attendance/live')
            ]);
            setAttendanceData({
                ...meResponse.data,
                liveData: liveResponse.data?.data || []
            });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleCheckInToggle = async () => {
        try {
            setActionLoading(true);
            const response = await apiClient.post('/staff/attendance/record');
            toast.success(response.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        return `${diffHrs}h ${diffMins}m`;
    };

    const isCheckedIn = !!attendanceData.activeShift;

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
                .fu { animation: fadeUp 0.4s ease both; }
                .spin { animation: spin 0.8s linear infinite; }
                .grid-header { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent}; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                .grid-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 16px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s; background: ${T.surface}; }
                .grid-row:hover { background: ${T.bg}; }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <UserCheck size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Staff Attendance</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Live Status</span>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Track your working hours and branch occupancy</p>
                        </div>
                    </div>
                </div>
                {loading && (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <RefreshCw size={20} color="#fff" className="spin" />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* INFO BANNER */}
                <div style={{ 
                    background: T.blueLight, padding: '16px 24px', borderRadius: 20, border: `1px solid ${T.blue}15`,
                    display: 'flex', alignItems: 'center', gap: 16
                }} className="fu">
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <Shield size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 10, fontWeight: 900, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Personal View</h4>
                        <p style={{ fontSize: 11, color: T.blue, fontWeight: 700, margin: '2px 0 0', opacity: 0.8 }}>You can only manage your own attendance. All records are synced with Branch Admin.</p>
                    </div>
                </div>

                {/* KPI STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }} className="fu">
                    <MetricCard title="Staff On-duty" value={attendanceData.stats.currentlyWorking} icon={Users} color={T.green} bg={T.greenLight} subtitle="Active Team" index={0} />
                    <MetricCard title="Today's Log" value={attendanceData.stats.todayCheckIns} icon={LogIn} color={T.accent} bg={T.accentLight} subtitle="Check-ins" index={1} />
                    <MetricCard title="Completed" value={attendanceData.stats.completedShifts} icon={LogOut} color={T.rose} bg={T.roseLight} subtitle="Total Shifts" index={2} />
                </div>

                {/* ACTION CARD */}
                <div style={{ 
                    background: T.surface, padding: 40, borderRadius: 32, border: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
                }} className="fu">
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 240, height: 240, background: `linear-gradient(135deg, ${T.accentLight} 0%, transparent 100%)`, opacity: 0.3, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: isCheckedIn ? T.green : T.subtle, animation: isCheckedIn ? 'pulse 2s infinite' : 'none' }} />
                            <h2 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.8px' }}>{isCheckedIn ? 'Currently On Shift' : 'Daily Sign-in'}</h2>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isCheckedIn ? `Shift active since ${formatTime(attendanceData.activeShift.checkIn)}` : 'Ready to start your work day?'}
                        </p>
                    </div>
                    <button 
                        onClick={handleCheckInToggle}
                        disabled={actionLoading}
                        style={{
                            height: 64, padding: '0 56px', borderRadius: 20, 
                            background: isCheckedIn ? T.rose : T.accent,
                            color: '#fff', border: 'none', fontSize: 13, fontWeight: 900, 
                            textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 14,
                            boxShadow: isCheckedIn ? '0 12px 32px rgba(244,63,94,0.25)' : '0 12px 32px rgba(124,92,252,0.25)',
                            transition: '0.3s', position: 'relative', zIndex: 2
                        }}
                    >
                        {actionLoading ? <RefreshCw size={22} className="spin" /> : (isCheckedIn ? <LogOut size={22} /> : <LogIn size={22} />)}
                        {isCheckedIn ? 'End Active Shift' : 'Sign-in To Branch'}
                    </button>
                </div>

                {/* TABLES GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="fu">
                    {/* CURRENTLY ON DUTY */}
                    <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '24px 32px', background: '#F9F8FF', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.greenLight, color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Active Team</h3>
                                <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>Live inside the branch</p>
                            </div>
                        </div>
                        <div className="grid-header">
                            {['Staff Profile', 'Check-in', 'Status'].map(h => <span key={h}>{h}</span>)}
                        </div>
                        {attendanceData.liveData?.length > 0 ? attendanceData.liveData.map((person, i) => (
                            <div key={i} className="grid-row">
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{person.name}</div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: T.accent, textTransform: 'uppercase' }}>{person.role}</div>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{person.time}</div>
                                <div>
                                    <div style={{ padding: '4px 10px', borderRadius: 8, background: T.greenLight, color: T.green, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', display: 'inline-block' }}>Active</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 60, textAlign: 'center', color: T.subtle, fontSize: 12, fontWeight: 700, background: T.surface }}>No active team members.</div>
                        )}
                    </div>

                    {/* PERSONAL LOGS */}
                    <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '24px 32px', background: '#F9F8FF', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><History size={20} /></div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Today's History</h3>
                                <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>Your shift records for today</p>
                            </div>
                        </div>
                        <div className="grid-header">
                            {['Interval', 'Duration', 'Result'].map(h => <span key={h}>{h}</span>)}
                        </div>
                        {attendanceData.logs.length > 0 ? attendanceData.logs.map((log, i) => (
                            <div key={i} className="grid-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{formatTime(log.checkIn)}</span>
                                    <span style={{ color: T.subtle }}>→</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: log.checkOut ? T.text : T.accent }}>{log.checkOut ? formatTime(log.checkOut) : 'LIFE'}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{calculateDuration(log.checkIn, log.checkOut)}</div>
                                <div>
                                    <div style={{ padding: '4px 10px', borderRadius: 8, background: log.checkOut ? T.greenLight : T.amberLight, color: log.checkOut ? T.green : T.amber, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', display: 'inline-block' }}>{log.checkOut ? 'COMPLETED' : 'ON-GOING'}</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 60, textAlign: 'center', color: T.subtle, fontSize: 12, fontWeight: 700, background: T.surface }}>No sign-in records for today.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrainerAttendance;
