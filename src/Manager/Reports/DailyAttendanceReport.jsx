import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Users, UserCheck, UserMinus, Download, Filter, Search, MoreVertical, ChevronLeft, ChevronRight, Eye, Trash2, X, Clock, MapPin, Smartphone, ChevronDown, Check, Loader2, Activity, ScanLine, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import { exportPDF } from '../../api/manager/managerExport';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)',
    headerShadow: '0 4px 20px -2px rgba(124, 92, 252, 0.06)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '160px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', height: '48px', padding: '0 16px', borderRadius: '14px',
                    border: `2px solid ${isOpen ? T.accent : T.border}`, background: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: isOpen ? '0 0 0 4px ' + T.accentLight : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={18} color={T.muted} />}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={18} color={T.muted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>

            <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}`,
                boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
                opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                pointerEvents: isOpen ? 'all' : 'none', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => { onChange(opt); setIsOpen(false); }}
                        style={{
                            width: '100%', padding: '12px 16px', border: 'none', background: value === opt ? T.accentLight : 'transparent',
                            color: value === opt ? T.accent : T.text, fontSize: '14px', fontWeight: '600', textAlign: 'left',
                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                    >
                        {opt === 'All' ? placeholder : opt}
                        {value === opt && <Check size={16} />}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DailyAttendanceReport = () => {
    const getToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [searchTerm, setSearchTerm] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ totalToday: 0, membersToday: 0, staffToday: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [directoryResults, setDirectoryResults] = useState([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [smartRecords, setSmartRecords] = useState([]);
    const [smartStats, setSmartStats] = useState({ today: 0, total: 0 });
    const { selectedBranch } = useBranchContext();
    const itemsPerPage = 5;
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch && selectedBranch !== 'all' ? selectedBranch : null;
            const [attendanceRes, statsRes, smartLogs, smartSummaryData] = await Promise.all([
                apiClient.get(`/admin/attendance?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm.trim()}&date=${selectedDate}`),
                apiClient.get('/admin/attendance/stats'),
                import('../../api/gymDeviceApi').then(api => api.fetchFaceAccessRecords(branchId, selectedDate)).catch(() => []),
                import('../../api/gymDeviceApi').then(api => api.fetchGymAttendanceSummary(1, 10, branchId).catch(() => ({ today: 0, total: 0 })))
            ]);

            const rawData = attendanceRes.data.data || [];
            const hardwareScans = (smartLogs || []).filter(log => log.createTime && new Date(log.createTime.replace(' ', 'T')).toLocaleDateString('en-CA') === selectedDate);
            setSmartRecords(hardwareScans);

            const calcDuration = (checkIn, checkOut) => {
                if (!checkIn || !checkOut || checkOut === '-' || checkIn === '-') return '-';
                try {
                    const parseTime = (str) => {
                        const [time, period] = str.trim().split(' ');
                        let [h, m] = time.split(':').map(Number);
                        if (period?.toLowerCase() === 'pm' && h !== 12) h += 12;
                        if (period?.toLowerCase() === 'am' && h === 12) h = 0;
                        const d = new Date(); d.setHours(h, m, 0, 0); return d;
                    };
                    const diffMs = parseTime(checkOut) - parseTime(checkIn);
                    if (diffMs <= 0) return '-';
                    const totalMins = Math.floor(diffMs / 60000);
                    const hrs = Math.floor(totalMins / 60); const mins = totalMins % 60;
                    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                } catch (e) { return '-'; }
            };

            const formatted = rawData.map(a => ({
                id: a.id, userId: a.userId || null, memberId: a.membershipId, name: a.name, type: a.type, role: a.role,
                checkIn: a.checkIn || a.time || '-', checkOut: a.checkOut || '-', duration: calcDuration(a.checkIn || a.time, a.checkOut),
                status: a.status, checkInMethod: a.checkInMethod || 'manual'
            }));

            setAttendance(formatted); setTotalItems(attendanceRes.data.total || formatted.length);
            if (statsRes.data) setAttendanceStats({ totalToday: statsRes.data.totalToday || 0, membersToday: statsRes.data.membersToday || 0, staffToday: statsRes.data.staffToday || 0 });
            setSmartStats({ today: (smartSummaryData?.today > 0) ? smartSummaryData.today : hardwareScans.length, total: (smartSummaryData?.total > 0) ? smartSummaryData.total : (Array.isArray(smartLogs) ? smartLogs.length : 0) });
        } catch (error) { toast.error("Failed to load attendance data"); }
        finally { setLoading(false); }
    }, [currentPage, itemsPerPage, searchTerm, selectedDate, selectedBranch]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim().length >= 2) fetchDirectoryResults();
            else setDirectoryResults([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedBranch]);

    const fetchDirectoryResults = async () => {
        try {
            setIsSearching(true);
            const res = await apiClient.get('/staff/attendance/search-all', { params: { search: searchTerm.trim(), branchId: selectedBranch } });
            const results = res.data.data || [];
            const checkedInIds = new Set(attendance.filter(a => a.status === 'Inside').map(a => a.memberId));
            setDirectoryResults(results.filter(r => r.personType !== 'Member' || !checkedInIds.has(r.code)));
        } catch (err) { console.error("Search error:", err); setDirectoryResults([]); }
        finally { setIsSearching(false); }
    };

    const handleExport = () => exportPDF(attendance, `Attendance_Report_${selectedDate}`);
    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await apiClient.delete(`/admin/attendance/${confirmModal.id}`);
            toast.success('Record removed successfully'); setConfirmModal({ isOpen: false, id: null, loading: false }); loadData();
        } catch (error) { toast.error('Failed to remove record'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const handleCheckIn = async (payload) => {
        try {
            const body = typeof payload === 'object' ? payload : { memberId: payload, type: 'Member' };
            await apiClient.post('/staff/attendance/check-in', body);
            toast.success(`${body.type || 'Member'} checked in successfully`); loadData(); setSearchTerm(''); setDirectoryResults([]);
        } catch (error) { toast.error(error.response?.data?.message || 'Check-in failed'); }
    };

    const handleCheckOut = async (attendanceId, memberId, entry) => {
        try {
            const isStaffOrTrainer = entry?.type === 'Staff' || entry?.type === 'Trainer' || entry?.role === 'TRAINER' || entry?.role === 'STAFF';
            const body = isStaffOrTrainer ? { userId: entry.userId || attendanceId, type: entry.type || (entry.role === 'TRAINER' ? 'Trainer' : 'Staff') } : { memberId: memberId || attendanceId, type: 'Member' };
            await apiClient.post('/staff/attendance/check-out', body); toast.success('Successfully checked out'); loadData();
        } catch (error) { toast.error(error.response?.data?.message || 'Check-out failed'); }
    };

    const statsCards = [
        { label: 'Manual In', value: attendance.filter(a => a.status === 'checked-in' || a.status === 'Inside').length.toString(), icon: Activity, color: T.success },
        { label: 'Today Total', value: attendanceStats.totalToday.toString(), icon: Users, color: T.accent },
        { label: 'Smart Face (Today)', value: smartStats.today.toString(), icon: Smartphone, color: '#9c27b0' },
        { label: 'Smart Face (Total)', value: smartStats.total.toString(), icon: ShieldCheck, color: T.accent2 },
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
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Attendance</h1>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Quick check-in / check-out</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: T.accentLight, borderRadius: '12px', height: '44px' }}>
                            <ScanLine size={18} color={T.accent} className="animate-pulse" />
                            <span style={{ fontSize: '11px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AIoT Hardware Active</span>
                        </div>
                        <button onClick={handleExport} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <Download size={18} color={T.muted} /> Export
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {statsCards.map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: stat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={26} color={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ ...S.card, padding: '24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, member code or phone..."
                        style={{ ...S.input, width: '100%', paddingLeft: '48px', border: `2px solid ${T.border}` }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ ...S.input, paddingLeft: '44px', fontWeight: '800', textTransform: 'uppercase', minWidth: '180px' }}
                        />
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        style={{ ...S.btn, background: T.accent, color: '#FFF', minWidth: '120px', boxShadow: '0 10px 20px -5px rgba(124, 92, 252, 0.3)' }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        Search
                    </button>
                </div>
            </div>

            {searchTerm && searchTerm.length >= 2 && (
                <div style={{ marginBottom: '40px', animation: 'slideUp 0.3s ease' }}>
                    <h2 style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={14} color={T.accent} /> Search Results ({directoryResults.length})
                        {isSearching && <Loader2 size={14} className="animate-spin" color={T.accent} />}
                    </h2>
                    {directoryResults.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {directoryResults.map(p => (
                                <div key={p.id} style={{ ...S.card, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>
                                            {p.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{p.name}</p>
                                            <p style={{ fontSize: '10px', fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.code || '-'}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${T.bg}` }}>
                                        <span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{p.personType}</span>
                                        <button onClick={() => handleCheckIn(p.checkInPayload)} style={{ ...S.btn, height: '36px', padding: '0 16px', background: T.accent, color: '#FFF' }}>Check In</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isSearching && (
                        <div style={{ ...S.card, padding: '40px', textAlign: 'center', borderStyle: 'dashed', opacity: 0.7 }}>
                            <p style={{ fontWeight: '800', fontSize: '12px', color: T.muted, textTransform: 'uppercase' }}>No matching members found</p>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={14} color={T.success} /> Currently In ({attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').length})
                </h2>
                {attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').map(p => (
                            <div key={p.id} style={{ ...S.card, padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>
                                        {p.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{p.name}</p>
                                        <p style={{ fontSize: '10px', fontWeight: '700', color: T.muted }}>{p.memberId || '-'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{p.type || p.role || 'Member'}</span>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: T.muted }}>In: {p.checkIn}</span>
                                </div>
                                <button onClick={() => handleCheckOut(p.id, p.memberId, p)} style={{ ...S.btn, width: '100%', background: T.bg, color: T.muted, border: `1px solid ${T.border}` }}>Check Out</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ ...S.card, padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', opacity: 0.6 }}>
                        <UserMinus size={32} color={T.subtle} style={{ marginBottom: '12px' }} />
                        <p style={{ fontWeight: '800', fontSize: '12px', color: T.muted, textTransform: 'uppercase', margin: 0 }}>No members currently checked in</p>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color={T.accent} /> Today's Manual Attendance ({attendance.filter(a => a.checkInMethod !== 'biometric').length})
                </h2>
                <div style={{ ...S.card, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                {['Member', 'Code', 'Check-In', 'Check-Out', 'Duration', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" color={T.accent} /></td></tr>
                            ) : attendance.filter(a => a.checkInMethod !== 'biometric').length > 0 ? (
                                attendance.filter(a => a.checkInMethod !== 'biometric').map(row => (
                                    <tr key={row.id} style={{ borderBottom: `1px solid ${T.border}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900' }}>{(row.name || '?').charAt(0)}</div>
                                                <span style={{ fontSize: '14px', fontWeight: '800', color: T.text }}>{row.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}><div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '12px', fontWeight: '800', color: T.muted }}>{row.memberId || 'MEM-001'}</span><span style={{ fontSize: '9px', fontWeight: '700', color: T.subtle, textTransform: 'uppercase' }}>Manual</span></div></td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '900', color: T.text }}>{row.checkIn}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: (row.checkOut && row.checkOut !== '-') ? T.error : T.subtle }}>{row.checkOut}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '900', color: T.success }}>{row.duration}</td>
                                        <td style={{ padding: '16px 24px' }}><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleDelete(row.id)} style={{ border: 'none', background: 'none', color: T.subtle, cursor: 'pointer' }}><Trash2 size={18} /></button></div></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: T.subtle, textTransform: 'uppercase' }}>No manual records for today</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}><Smartphone size={14} color={T.accent} /> Smart AIoT Access (Hardware Sync)</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', border: '1px solid #d1fae5' }}><div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} className="animate-pulse"></div><span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Live Feed</span></div>
                </div>
                <div style={{ ...S.card, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                                {['User / Member', 'Device', 'Method', 'Time', 'Photo'].map(h => (
                                    <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" color={T.accent} /></td></tr>
                            ) : smartRecords.length > 0 ? (
                                smartRecords.slice(0, 50).map(record => (
                                    <tr key={record.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                                        <td style={{ padding: '16px 24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900' }}>{(record.personName || 'V').charAt(0)}</div><div><p style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>{record.personName || 'Unknown Visitor'}</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>{record.personSn || 'Hardware ID: ' + record.id}</p></div></div></td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '11px', fontWeight: '800', color: T.text, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} color={T.accent} /> {record.deviceName}</span></td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ ...S.badge, background: T.bg, color: T.muted, border: `1px solid ${T.border}` }}>{['face_0', 'face_1', 'face_2'].includes(record.passType) ? 'Face Scan' : (record.passType || 'ID Card')}</span></td>
                                        <td style={{ padding: '16px 24px' }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: T.bg, borderRadius: '10px', border: `1px solid ${T.border}`, fontSize: '12px', fontWeight: '900', color: T.text }}><Clock size={12} color={T.muted} />{record.createTime ? new Date(record.createTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) : '-'}</div></td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>{record.imageUrl ? <img src={record.imageUrl} alt="Scan" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: `2px solid #FFF`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} /> : <Activity size={18} color={T.subtle} />}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: T.subtle, textTransform: 'uppercase' }}>No hardware logs found for this date</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Log Details" subtitle="Attendance data overview" width="400px">
                {selectedEntry && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '24px', background: T.bg, borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', marginBottom: '16px' }}>{(selectedEntry.name || '?').charAt(0)}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>{selectedEntry.name}</h3>
                            <p style={{ fontSize: '12px', fontWeight: '800', color: T.muted, textTransform: 'uppercase' }}>{selectedEntry.memberId || 'MEM-001'}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px', background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}` }}><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Check-In</p><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{selectedEntry.time || selectedEntry.checkIn || '-'}</p></div>
                            <div style={{ padding: '16px', background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}` }}><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Check-Out</p><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{selectedEntry.checkOut || '-'}</p></div>
                        </div>
                        <button onClick={() => setIsViewModalOpen(false)} style={{ ...S.btn, background: T.accent, color: '#FFF' }}>Close Details</button>
                    </div>
                )}
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Remove Attendance Record?" message="This attendance record will be permanently deleted from the daily log." confirmText="Remove" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default DailyAttendanceReport;
