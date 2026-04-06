import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Clock, Zap, Search, Filter, Activity, 
    Plus, Target, MapPin, Users, Loader2, X, RefreshCw, Layers, 
    CheckCircle2, Sparkles, Send, Dumbbell, History, UserCheck
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { fetchPTAccounts, bookPTSession } from '../../api/member/memberApi';

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

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const MemberBookings = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [bookingType, setBookingType] = useState('Class');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [ptAccounts, setPtAccounts] = useState([]);
    const [selectedPtAccountId, setSelectedPtAccountId] = useState('');
    const [ptTime, setPtTime] = useState('');

    const tabs = ['All', 'Recovery', 'Classes', 'PT'];

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/member/bookings');
                setBookings(response.data || []);
            } catch (err) { console.error("Failed to fetch bookings:", err); }
            finally { setLoading(false); }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const name = (b.class?.name || '').toLowerCase();
        if (activeTab === 'All') return true;
        if (activeTab === 'Recovery') return name.includes('sauna') || name.includes('ice bath') || name.includes('recovery');
        if (activeTab === 'PT') return name.includes('pt') || name.includes('personal') || name.includes('training');
        if (activeTab === 'Classes') return !name.includes('sauna') && !name.includes('ice bath') && !name.includes('recovery') && !name.includes('pt') && !name.includes('personal') && !name.includes('training');
        return true;
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
        return timeStr.substring(0, 5);
    };

    const handleOpenBookingModal = async () => {
        setIsBookingModalOpen(true); setLoadingClasses(true);
        setSelectedClassId(''); setBookingDate(''); setPtTime(''); setSelectedPtAccountId('');
        try {
            const [classRes, ptRes] = await Promise.all([apiClient.get('/member/classes'), fetchPTAccounts()]);
            setAvailableClasses(classRes.data || []);
            setPtAccounts(ptRes.filter(acc => acc.status === 'Active' && acc.member?.status === 'Active' && (!acc.package?.totalSessions || acc.remainingSessions > 0)));
        } catch (err) { toast.error("Failed to load options."); }
        finally { setLoadingClasses(false); }
    };

    const handleBookClass = async () => {
        if (bookingType === 'Class' && (!selectedClassId || !bookingDate)) return toast.error("Select session & date.");
        if (bookingType === 'PT' && (!selectedPtAccountId || !bookingDate || !ptTime)) return toast.error("Select package, date & time.");
        setIsSubmitting(true);
        try {
            if (bookingType === 'Class') {
                const res = await apiClient.post('/member/bookings', { classId: selectedClassId, date: bookingDate });
                if (res.data.invoice) { toast.success("Invoice generated!"); navigate('/member/payments'); return; }
            } else {
                await bookPTSession({ ptAccountId: selectedPtAccountId, date: bookingDate, time: ptTime, duration: 60 });
            }
            toast.success("Successfully booked!"); setIsBookingModalOpen(false);
            setLoading(true); const bRes = await apiClient.get('/member/bookings'); setBookings(bRes.data || []); setLoading(false);
        } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
        finally { setIsSubmitting(false); }
    };

    if (loading) return <Loader message="Opening the scheduler..." />;

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
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Book & Schedule</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Reserve your classes, recovery sessions and PT slots</p>
                    </div>
                </div>
                <button onClick={handleOpenBookingModal} style={{ padding: '0 28px', height: 44, background: '#fff', color: T.accent, borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}><Plus size={18} strokeWidth={3} /> My Bookings</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* FILTER TABS */}
                <div style={{ display: 'flex', gap: 12 }} className="animate-fadeIn">
                    {tabs.map(tab => (
                        <button 
                            key={tab} onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px', borderRadius: 16, border: `2px solid ${activeTab === tab ? T.accent : T.surface}`,
                                background: activeTab === tab ? T.accent : T.surface,
                                color: activeTab === tab ? '#fff' : T.muted,
                                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                cursor: 'pointer', transition: '0.2s',
                                boxShadow: activeTab === tab ? '0 8px 24px rgba(124,92,252,0.15)' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* BOOKINGS GRID */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <SectionHeader icon={History} title="Active Schedules" subtitle="Upcoming sessions for the week" />
                    
                    {filteredBookings.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                            {filteredBookings.map((b, idx) => (
                                <PremiumCard key={b.id} index={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} /></div>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                            background: b.status === 'Completed' ? T.greenLight : b.status === 'Cancelled' ? T.roseLight : b.status === 'Pending Payment' ? T.amberLight : T.blueLight,
                                            color: b.status === 'Completed' ? T.green : b.status === 'Cancelled' ? T.rose : b.status === 'Pending Payment' ? T.amber : T.blue
                                        }}>{b.status}</span>
                                    </div>
                                    <h4 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: '0 0 4px', lineHeight: 1.2 }}>{b.class?.name || 'Training Session'}</h4>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: '0 0 16px' }}>{b.class?.type || 'Standard'}</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: `1px solid ${T.bg}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <CalendarIcon size={14} color={T.accent} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Clock size={14} color={T.accent} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{formatTime(b.class?.startTime)} — {formatTime(b.class?.endTime)}</span>
                                        </div>
                                        {b.class?.trainer && (
                                             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Users size={14} color={T.accent} />
                                                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{b.class.trainer.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {b.status === 'Pending Payment' && (
                                        <button onClick={() => navigate('/member/payments')} style={{ marginTop: 20, width: '100%', height: 44, borderRadius: 12, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,92,252,0.1)' }}>Pay to Confirm</button>
                                    )}
                                </PremiumCard>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 80, border: `2px dashed ${T.border}`, borderRadius: 24, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarIcon size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                            <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text }}>No Scheduled Bookings</h4>
                            <p style={{ color: T.muted, fontSize: 13, fontWeight: 700 }}>Your active class and PT sessions will be listed here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* BOOKING MODAL */}
            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Create New Booking" maxWidth="max-w-md">
                <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', padding: 6, background: T.bg, borderRadius: 16 }}>
                        <button onClick={() => setBookingType('Class')} style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: bookingType === 'Class' ? '#fff' : 'transparent', color: bookingType === 'Class' ? T.accent : T.muted, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: bookingType === 'Class' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>Classes & Recovery</button>
                        <button onClick={() => setBookingType('PT')} style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: bookingType === 'PT' ? '#fff' : 'transparent', color: bookingType === 'PT' ? T.accent : T.muted, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: bookingType === 'PT' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>Private Training</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Date</label>
                        <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', border: `2px solid ${T.border}`, padding: '0 16px', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none' }} />
                    </div>

                    {bookingType === 'Class' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Session</label>
                                <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', border: `2px solid ${T.border}`, padding: '0 16px', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none' }}>
                                    <option value="">-- Choose Option --</option>
                                    {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name} {c.startTime ? `(${formatTime(c.startTime)})` : ''}</option>)}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
                             {ptAccounts.length === 0 ? (
                                <div style={{ padding: 20, background: T.roseLight, color: T.rose, borderRadius: 16, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>No active PT packages available. Purchase a package to book private sessions.</div>
                             ) : (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PT Package</label>
                                        <select value={selectedPtAccountId} onChange={e => setSelectedPtAccountId(e.target.value)} style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', border: `2px solid ${T.border}`, padding: '0 16px', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none' }}>
                                            <option value="">-- Select Package --</option>
                                            {ptAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.package?.name} ({acc.remainingSessions} Left)</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preferred Time</label>
                                        <input type="time" value={ptTime} onChange={e => setPtTime(e.target.value)} style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', border: `2px solid ${T.border}`, padding: '0 16px', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none' }} />
                                    </div>
                                </>
                             )}
                        </div>
                    )}

                    <button onClick={handleBookClass} disabled={isSubmitting} style={{ height: 56, background: T.accent, color: '#fff', borderRadius: 16, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                        {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />} Commit Booking
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default MemberBookings;
