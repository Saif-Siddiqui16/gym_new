import { exportPDF } from '../../api/manager/managerExport';
import apiClient from '../../api/apiClient';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    ClipboardList, ChevronDown, Check, ChevronLeft, ChevronRight, Filter, Search,
    Clock, Eye, Trash2, User, Calendar, Tag, FileText, Activity, MapPin
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/common/ConfirmationModal';

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
                type="button" onClick={() => setIsOpen(!isOpen)}
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
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}`,
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden'
                }}>
                    {options.map((opt) => (
                        <button
                            key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
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
            )}
        </div>
    );
};

const BookingReport = () => {
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const [dateRange, setDateRange] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState([]);
    const [bookingStats, setBookingStats] = useState({ total: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 10;
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [allFilteredBookings, setAllFilteredBookings] = useState([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            let startDate = '', endDate = '';
            const today = new Date();
            const toLocalISO = (date) => date.toLocaleDateString('en-CA');
            if (dateRange === 'Today') { startDate = toLocalISO(today); endDate = startDate; }
            else if (dateRange === 'This Week') { const day = today.getDay(); const diff = today.getDate() - day + (day === 0 ? -6 : 1); const startOfWeek = new Date(new Date().setDate(diff)); startDate = toLocalISO(startOfWeek); }
            else if (dateRange === 'This Month') { const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); startDate = toLocalISO(startOfMonth); }

            const params = { search: searchTerm, status: statusFilter === 'All Status' || statusFilter === 'All' ? '' : statusFilter, branchId, startDate, endDate };
            const [bookingsRes, statsRes] = await Promise.all([
                apiClient.get('/admin/bookings', { params }),
                apiClient.get('/admin/bookings/stats', { params })
            ]);

            const rawData = bookingsRes?.data?.data || [];
            const formatted = rawData.map(b => {
                const dateObj = b.date ? new Date(b.date) : null;
                return {
                    id: b.id, memberId: b.member?.memberId || `MEM-${b.memberId}`, memberName: b.member?.name || 'Unknown',
                    memberPhone: b.member?.phone || '', planName: b.member?.plan?.name || 'No Plan',
                    classType: b.class?.name || (b.classId ? `Class #${b.classId}` : 'Session'), classCategory: b.class?.type || 'Workout',
                    location: b.class?.location || '', duration: b.class?.duration || '', trainerName: b.class?.trainer?.name || b.member?.trainer?.name || 'Unassigned',
                    date: dateObj ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                    time: dateObj ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
                    status: b.status || 'Upcoming'
                };
            });

            setAllFilteredBookings(formatted); setTotalItems(formatted.length); setCurrentPage(1);
            setBookings(formatted.slice(0, itemsPerPage));
            if (statsRes?.data) setBookingStats({ total: statsRes.data.total || 0, completed: statsRes.data.completed || 0, cancelled: statsRes.data.cancelled || 0 });
        } catch (error) { console.error('Booking Load Error:', error); setAllFilteredBookings([]); setBookings([]); setTotalItems(0); }
        finally { setLoading(false); }
    }, [dateRange, statusFilter, searchTerm, selectedBranch, itemsPerPage]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        setBookings(allFilteredBookings.slice(startIndex, startIndex + itemsPerPage));
    }, [currentPage, allFilteredBookings, itemsPerPage]);

    const handleExport = () => exportPDF(allFilteredBookings, 'Booking_Report');
    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await apiClient.delete(`/admin/bookings/${confirmModal.id}`);
            setConfirmModal({ isOpen: false, id: null, loading: false }); loadData();
        } catch (error) { toast.error('Failed to delete booking.'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const handleViewDetails = (booking) => { setSelectedBooking(booking); setIsViewModalOpen(true); };

    const getStatusStyle = (status) => {
        if (status === 'Completed') return { background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' };
        if (status === 'Cancelled') return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' };
        return { background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' };
    };

    const statsCards = [
        { label: 'Total Bookings', value: bookingStats.total, icon: ClipboardList, color: T.accent, bg: T.accentLight },
        { label: 'Completed', value: bookingStats.completed, icon: Check, color: T.success, bg: '#ecfdf5' },
        { label: 'Cancelled', value: bookingStats.cancelled, icon: Trash2, color: T.error, bg: '#fff1f2' },
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>All Bookings</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Class & PT session bookings for all members</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleExport} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}><FileText size={16} /> Export PDF</button>
                    <button onClick={() => setShowFilters(!showFilters)} style={{ ...S.btn, padding: '0 12px', background: showFilters ? T.accentLight : '#FFF', color: showFilters ? T.accent : T.muted, border: `1px solid ${showFilters ? T.accentMid : T.border}` }}><Filter size={18} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {statsCards.map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={24} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ ...S.card, overflow: 'visible' }}>
                {showFilters && (
                    <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <CustomDropdown options={['All', 'Today', 'This Week', 'This Month']} value={dateRange} onChange={setDateRange} placeholder="All Time" icon={Calendar} />
                            <CustomDropdown options={['All', 'Upcoming', 'Completed', 'Cancelled']} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" icon={Tag} />
                        </div>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text" placeholder="Search by member or class..."
                                style={{ ...S.input, width: '100%', paddingLeft: '48px' }}
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Booking ID', 'Member', 'Class / Type', 'Trainer', 'Date / Time', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '80px', textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}><div style={{ width: '24px', height: '24px', border: '3px solid ' + T.accent, borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin"></div><span style={{ fontSize: '12px', fontWeight: '700', color: T.accent }}>Generating Report...</span></div></td></tr>
                            ) : bookings.length > 0 ? (
                                bookings.map(row => (
                                    <tr key={row.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '12px', fontWeight: '800', color: T.accent, background: T.accentLight, padding: '4px 8px', borderRadius: '8px' }}>#{row.id}</span></td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>{row.memberName.charAt(0)}</div>
                                                <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{row.memberName}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{row.memberId} · {row.planName}</p></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}><div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{row.classType}</p><span style={{ fontSize: '10px', fontWeight: '700', color: T.muted, background: T.bg, padding: '2px 6px', borderRadius: '4px' }}>{row.classCategory}</span></div></td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: T.text }}>{row.trainerName}</td>
                                        <td style={{ padding: '16px 24px' }}><div><p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>{row.date}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {row.time}</p></div></td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ ...S.badge, ...getStatusStyle(row.status) }}>{row.status}</span></td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => handleViewDetails(row)} style={{ border: 'none', background: 'none', color: T.subtle, cursor: 'pointer', padding: '6px' }}><Eye size={18} /></button>
                                                <button onClick={() => handleDelete(row.id)} style={{ border: 'none', background: 'none', color: T.subtle, cursor: 'pointer', padding: '6px' }}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{ padding: '80px', textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}><div style={{ padding: '16px', background: T.bg, borderRadius: '50%' }}><Filter size={32} color={T.subtle} /></div><p style={{ fontSize: '14px', fontWeight: '700', color: T.muted }}>No bookings found for the selected filters.</p></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalItems > 0 && (
                    <div style={{ padding: '20px 24px', background: T.bg + '50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Showing <span style={{ color: T.text }}>{(currentPage - 1) * itemsPerPage + 1}</span> - <span style={{ color: T.text }}>{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span style={{ color: T.text }}>{totalItems}</span></span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ width: '40px', height: '40px', background: '#FFF', border: `1px solid ${T.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}><ChevronLeft size={20} /></button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))} disabled={currentPage === Math.ceil(totalItems / itemsPerPage)} style={{ width: '40px', height: '40px', background: '#FFF', border: `1px solid ${T.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === Math.ceil(totalItems / itemsPerPage) ? 'not-allowed' : 'pointer', opacity: currentPage === Math.ceil(totalItems / itemsPerPage) ? 0.5 : 1 }}><ChevronRight size={20} /></button>
                        </div>
                    </div>
                )}
            </div>

            <RightDrawer isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Booking Details" subtitle="Class and session information" width="500px">
                {selectedBooking && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '24px', background: T.bg, borderRadius: '24px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '24px' }}>{selectedBooking.memberName.charAt(0)}</div>
                            <div>
                                <p style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>{selectedBooking.memberName}</p>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, margin: '2px 0' }}>{selectedBooking.memberId}</p>
                                <span style={{ ...S.badge, background: T.accent, color: '#FFF', marginTop: '8px', display: 'inline-block' }}>{selectedBooking.planName}</span>
                            </div>
                        </div>
                        <div style={{ ...S.card, padding: '0', overflow: 'hidden' }}>
                            {[
                                { label: 'Booking ID', value: '#' + selectedBooking.id },
                                { label: 'Class / Session', value: selectedBooking.classType },
                                { label: 'Type', value: selectedBooking.classCategory },
                                { label: 'Trainer', value: selectedBooking.trainerName },
                                { label: 'Date', value: selectedBooking.date },
                                { label: 'Time', value: selectedBooking.time }
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: '16px 20px', borderBottom: idx === 5 ? 'none' : `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: T.muted }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: T.text }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsViewModalOpen(false)} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '48px', borderRadius: '16px' }}>Close</button>
                    </div>
                )}
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Cancel Booking?" message="This booking will be permanently removed. The member will need to re-book." confirmText="Cancel Booking" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default BookingReport;
