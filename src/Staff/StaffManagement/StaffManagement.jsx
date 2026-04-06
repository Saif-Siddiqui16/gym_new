import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, CheckCircle, Clock, Briefcase, RefreshCw,
    ArrowDownLeft, ArrowUpRight, Loader2, CalendarDays,
    Search, UserCircle, AlertCircle
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const fetchLiveStaffAttendance = () => apiClient.get('/admin/attendance/live').then(r => r.data);
const fetchTodayStaffAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get('/admin/attendance', { params: { type: 'Staff', date: today, limit: 200 } }).then(r => r.data);
};
const fetchAttendanceStats = () => apiClient.get('/admin/attendance/stats').then(r => r.data);

const StaffManagement = ({ role }) => {
    const [liveStaff, setLiveStaff] = useState([]);
    const [todayLog, setTodayLog] = useState([]);
    const [stats, setStats] = useState({ staffToday: 0, currentlyIn: 0 });
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [liveRes, todayRes, statsRes] = await Promise.all([
                fetchLiveStaffAttendance(), fetchTodayStaffAttendance(), fetchAttendanceStats()
            ]);
            const liveStaffOnly = (liveRes?.data || []).filter(a => a.type === 'Staff' || a.type !== 'Member');
            setLiveStaff(liveStaffOnly);
            const todayStaffOnly = (todayRes?.data || []).filter(a => a.type === 'Staff' || a.role !== 'Member');
            setTodayLog(todayStaffOnly);
            setStats(statsRes || { staffToday: 0, currentlyIn: 0 });
            setLastRefreshed(new Date());
        } catch (err) { toast.error('Failed to load staff attendance data'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); const interval = setInterval(loadData, 60000); return () => clearInterval(interval); }, [loadData]);

    const filteredLive = liveStaff.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.role || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredToday = todayLog.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.role || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const completedShifts = todayLog.filter(a => a.status === 'checked-out').length;

    const statsCards = [
        { label: 'Currently Working', value: liveStaff.length.toString(), icon: Users, color: T.success, bg: '#f0fdf4' },
        { label: "Today's Check-ins", value: todayLog.length.toString(), icon: CheckCircle, color: T.accent, bg: T.accentLight },
        { label: 'Completed Shifts', value: completedShifts.toString(), icon: Clock, color: T.accent2, bg: '#f5f3ff' },
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ ...S.card, padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: `linear-gradient(225deg, ${T.accentLight} 0%, rgba(255,255,255,0) 70%)`, pointerEvents: 'none' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.25)' }}><Users size={28} /></div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Staff Attendance</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live attendance tracking for your branch</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...S.input, width: '280px', paddingLeft: '48px' }} />
                        </div>
                        <button onClick={loadData} disabled={loading} style={{ ...S.btn, background: T.accent, color: '#FFF', width: '130px', boxShadow: '0 10px 20px -5px rgba(124, 92, 252, 0.3)' }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {statsCards.map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={26} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '32px', fontWeight: '900', color: T.text, margin: 0 }}>{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <section>
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: T.text, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.success, boxShadow: `0 0 10px ${T.success}` }} className="animate-pulse" />
                            Currently On Duty
                            <span style={{ fontSize: '12px', fontWeight: '900', background: '#ecfdf5', color: T.success, padding: '4px 10px', borderRadius: '10px', border: '1px solid #d1fae5' }}>{loading ? '…' : liveStaff.length}</span>
                        </h2>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Staff currently checked in to your branch</p>
                    </div>
                    <div style={{ ...S.card, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: T.bg }}>
                                    {['Staff Member', 'Role', 'Check-in Time', 'Duration', 'Status'].map(h => h && <th key={h} style={{ padding: '20px 32px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '80px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color={T.accent} /></td></tr>
                                ) : filteredLive.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={32} color={T.subtle} /></div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>No staff currently on duty</h3>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: T.subtle }}>Check-ins will appear here in real time</p>
                                        </div>
                                    </td></tr>
                                ) : (
                                    filteredLive.map(staff => (
                                        <tr key={staff.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>{(staff.name || '?').charAt(0)}</div>
                                                    <span style={{ fontSize: '15px', fontWeight: '800', color: T.text }}>{staff.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ ...S.badge, background: staff.role === 'TRAINER' ? T.accentLight : T.bg, color: staff.role === 'TRAINER' ? T.accent : T.muted }}>{staff.role || 'Staff'}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '900', color: T.success, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <ArrowDownLeft size={16} /> {staff.time || '—'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px', fontSize: '14px', fontWeight: '700', color: T.text }}>{staff.duration || 'Ongoing'}</td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '900', color: T.success, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.success }} className="animate-pulse" /> On Duty
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: T.text, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CalendarDays size={24} color={T.accent} />
                            Today's Attendance Log
                            <span style={{ fontSize: '12px', fontWeight: '900', background: T.accentLight, color: T.accent, padding: '4px 10px', borderRadius: '10px', border: `1px solid ${T.accentMid}` }}>{loading ? '…' : todayLog.length}</span>
                        </h2>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>All staff check-ins for today in your branch</p>
                    </div>
                    <div style={{ ...S.card, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: T.bg }}>
                                    {['Staff Member', 'Role', 'Check-in', 'Check-out', 'Duration', 'Status'].map(h => <th key={h} style={{ padding: '20px 32px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '80px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color={T.accent} /></td></tr>
                                ) : filteredToday.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '100px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={32} color={T.subtle} /></div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>No attendance records for today</h3>
                                        </div>
                                    </td></tr>
                                ) : (
                                    filteredToday.map(staff => (
                                        <tr key={staff.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: staff.status === 'checked-in' ? T.accentLight : T.bg, color: staff.status === 'checked-in' ? T.accent : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>{(staff.name || '?').charAt(0)}</div>
                                                    <span style={{ fontSize: '15px', fontWeight: '800', color: T.text }}>{staff.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ ...S.badge, background: staff.role === 'TRAINER' ? T.accentLight : T.bg, color: staff.role === 'TRAINER' ? T.accent : T.muted }}>{staff.role || 'Staff'}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '900', color: T.success, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <ArrowDownLeft size={16} /> {staff.checkIn || staff.time || '—'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                {(staff.checkOut && staff.checkOut !== '-') ? (
                                                    <span style={{ fontSize: '14px', fontWeight: '900', color: T.error, display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowUpRight size={16} /> {staff.checkOut}</span>
                                                ) : <span style={{ fontSize: '12px', fontWeight: '600', color: T.subtle, fontStyle: 'italic' }}>Still in</span>}
                                            </td>
                                            <td style={{ padding: '20px 32px', fontSize: '14px', fontWeight: '700', color: T.text }}>{staff.duration || (staff.status === 'checked-in' ? 'Ongoing' : '—')}</td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '900', color: staff.status === 'checked-in' ? T.success : T.subtle, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: staff.status === 'checked-in' ? T.success : T.subtle }} /> {staff.status === 'checked-in' ? 'On Duty' : 'Completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StaffManagement;
