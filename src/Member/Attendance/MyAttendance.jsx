import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Clock, Activity, CheckCircle2, ChevronLeft, 
    ChevronRight, Search, Loader2, LogIn, LogOut, Dumbbell, RefreshCw, Star, 
    Zap, Sparkles, UserCheck, History
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0, hoverable = true }) => {
    return (
        <div 
            style={{
                background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
                padding: 32, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
                ...style
            }}
        >
            {children}
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div 
        style={{
            background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
            animation: `fadeUp 0.4s ease both ${0.3 + index * 0.05}s`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
        <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', marginTop: 4 }}>{subtitle}</div>
        </div>
    </div>
);

const MyAttendance = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({ logs: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [checkInStatus, setCheckInStatus] = useState({ isCheckedIn: false, isCheckedOut: false, checkInTime: null, checkOutTime: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const [attRes, statusRes] = await Promise.all([
                apiClient.get('/member/attendance'),
                apiClient.get('/member/attendance/status')
            ]);
            setAttendanceData(attRes.data);
            setCheckInStatus(statusRes.data);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
            toast.error("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAttendance(); }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await apiClient.post('/member/attendance/check-in');
            toast.success('✅ Checked in successfully!');
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await apiClient.post('/member/attendance/check-out');
            toast.success('✅ Checked out successfully!');
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally { setActionLoading(false); }
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDay(currentYear, currentMonth);
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const isVisited = (date) => attendanceData.logs.some(log => {
        const d = new Date(log.date || log.checkIn);
        return d.getDate() === date && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const formatTime = (isoStr) => {
        if (!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (loading) return <Loader message="Accessing attendance logs..." />;

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .animate-fadeIn { animation: fadeUp 0.4s ease both; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CalendarIcon size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>My Attendance</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Track your gym visits and check-in history</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                    <CalendarIcon size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{monthName} {currentYear}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* CHECK-IN HERO CARD */}
                <div style={{ 
                    background: checkInStatus.isCheckedIn ? '#E8FBF2' : '#F9F8FF', 
                    padding: 48, borderRadius: 40, border: `2px solid ${checkInStatus.isCheckedIn ? '#22C97A15' : T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
                }} className="animate-fadeIn">
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: `linear-gradient(135deg, ${checkInStatus.isCheckedIn ? T.greenLight : T.accentLight} 0%, transparent 100%)`, opacity: 0.4, pointerEvents: 'none' }} />
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 10, background: checkInStatus.isCheckedIn ? T.green : T.accent, color: '#fff', marginBottom: 16 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: checkInStatus.isCheckedIn ? 'pulse 2s infinite' : 'none' }} />
                            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{checkInStatus.isCheckedIn ? 'Session Live' : 'Offline'}</span>
                        </div>
                        <h2 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: '0 0 12px', letterSpacing: '-1px' }}>
                            {checkInStatus.isCheckedIn ? "Great workout day!" : checkInStatus.isCheckedOut ? "Workout Completed!" : "Ready to Train?"}
                        </h2>
                        <div style={{ display: 'flex', gap: 24 }}>
                            {checkInStatus.checkInTime && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.green }}><LogIn size={16} /></div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>In: {formatTime(checkInStatus.checkInTime)}</span>
                                </div>
                            )}
                            {checkInStatus.checkOutTime && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.rose }}><LogOut size={16} /></div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Out: {formatTime(checkInStatus.checkOutTime)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        {!checkInStatus.isCheckedIn && !checkInStatus.isCheckedOut && (
                            <button onClick={handleCheckIn} disabled={actionLoading} style={{ height: 64, padding: '0 48px', background: T.accent, color: '#fff', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 12px 32px rgba(124,92,252,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20} />} Check In Now
                            </button>
                        )}
                        {checkInStatus.isCheckedIn && (
                            <button onClick={handleCheckOut} disabled={actionLoading} style={{ height: 64, padding: '0 48px', background: T.rose, color: '#fff', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 12px 32px rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <LogOut size={20} />} End Session
                            </button>
                        )}
                        {checkInStatus.isCheckedOut && (
                            <div style={{ height: 64, padding: '0 48px', background: T.green, color: '#fff', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', border: 'none' }}>
                                <CheckCircle2 size={24} /> Done for Today
                            </div>
                        )}
                    </div>
                </div>

                {/* STATS ROW */}
                <div style={{ display: 'flex', gap: 24 }}>
                    <MetricCard title="Total Visits" value={attendanceData.stats.totalVisits || 0} icon={CheckCircle2} color={T.accent} bg={T.accentLight} subtitle="Overall" index={0} />
                    <MetricCard title="Days Active" value={attendanceData.stats.visitsThisMonth || 0} icon={CalendarIcon} color={T.green} bg={T.greenLight} subtitle="This Month" index={1} />
                    <MetricCard title="Avg Duration" value={attendanceData.stats.avgDuration || '0 m'} icon={Clock} color={T.amber} bg={T.amberLight} subtitle="Per Session" index={2} />
                    <MetricCard title="Consistency" value={attendanceData.stats.consistency || '0%'} icon={Activity} color={T.blue} bg={T.blueLight} subtitle="Visit Rate" index={3} />
                </div>

                {/* CALENDAR & RECENT LOGS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                    
                    {/* CALENDAR SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <PremiumCard index={4}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                <SectionHeader icon={CalendarIcon} title="Attendance Calendar" subtitle="Monthly progress overview" />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
                                {weekDays.map(day => (
                                    <div key={day} style={{ textAlign: 'center', padding: '12px 0', fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{day}</div>
                                ))}
                                {blanks.map(b => <div key={`b-${b}`} />)}
                                {dates.map(date => {
                                    const visited = isVisited(date);
                                    return (
                                        <div key={date} style={{ 
                                            aspectRatio: '1', borderRadius: 20, 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            background: visited ? T.accent : '#F9F8FF',
                                            color: visited ? '#fff' : T.text,
                                            border: `1px solid ${visited ? T.accent : T.border}`,
                                            fontWeight: 900, fontSize: 14, cursor: 'default', transition: '0.2s',
                                            boxShadow: visited ? '0 8px 20px rgba(124,92,252,0.2)' : 'none'
                                        }}>
                                            {date}
                                            {visited && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', marginTop: 4, opacity: 0.6 }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </PremiumCard>
                    </div>

                    {/* RECENT ACTIVITY SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <PremiumCard index={5} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <SectionHeader icon={History} title="Recent Activity" subtitle="Your latest logs" color={T.amber} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
                                {attendanceData.logs.length > 0 ? attendanceData.logs.slice(0, 8).map((log, i) => (
                                    <div key={i} style={{ padding: '16px 20px', borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} /></div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{new Date(log.date || log.checkIn).toLocaleDateString('en-GB')}</p>
                                                <p style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', margin: 0 }}>Gym Session</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.green, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}><LogIn size={12} /> {formatTime(log.checkIn)}</div>
                                            {log.checkOut && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.rose, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}><LogOut size={12} /> {formatTime(log.checkOut)}</div>}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: 48, opacity: 0.4 }}><History size={40} /><p style={{ fontSize: 12, fontWeight: 700, marginTop: 12 }}>No recent logs.</p></div>
                                )}
                            </div>
                        </PremiumCard>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MyAttendance;
