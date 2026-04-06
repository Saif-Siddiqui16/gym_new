import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Users, CheckCircle, FileText, Banknote, Edit2,
    Trash2, MoreHorizontal, Clock, Briefcase, Eye, RefreshCw,
    CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, UserCircle,
    IndianRupee, CalendarDays, AlertCircle, FileDown, ChevronDown, Filter, Sparkles
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { 
    fetchStaffAPI, 
    deleteStaffAPI, 
    fetchPayrollHistoryAPI, 
    generatePayrollAPI, 
    updatePayrollStatusAPI, 
    deletePayrollAPI,
    downloadPayslipAPI
} from '../../../api/admin/adminApi';
import { syncStaffToMipsAPI } from '../../../api/manager/managerApi';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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

const getLiveAttendance = async () => (await apiClient.get('/admin/attendance/live')).data;
const getTodayStaffAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    return (await apiClient.get('/admin/attendance', { params: { type: 'Staff', date: today, limit: 100 } })).data;
};
const getAttendanceStats = async () => (await apiClient.get('/admin/attendance/stats')).data;

const Payroll = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [staffList, setStaffList] = useState([]);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ currentlyIn: 0, totalToday: 0, membersToday: 0, staffToday: 0 });
    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [payrollLoading, setPayrollLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Employees');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: null, label: '', loading: false });

    const loadStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchStaffAPI(selectedBranch);
            const normalized = (Array.isArray(data) ? data : []).map(s => {
                let config = {};
                try { config = typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {}); } catch { }
                return { ...s, baseSalary: (s.baseSalary !== null && s.baseSalary !== undefined) ? Number(s.baseSalary) : null, commissionPercent: s.commissionPercent ?? config.commission ?? config.commissionPercent ?? 0, position: config.position || s.role || 'Staff' };
            });
            setStaffList(normalized);
        } catch (err) { toast.error('Failed to load staff list'); }
        finally { setLoading(false); }
    }, [selectedBranch]);

    const loadPayroll = useCallback(async () => {
        setPayrollLoading(true);
        try { const data = await fetchPayrollHistoryAPI(); setPayrollHistory(Array.isArray(data) ? data : []); }
        catch (err) { } finally { setPayrollLoading(false); }
    }, []);

    const loadAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        try {
            const [liveRes, todayRes, statsRes] = await Promise.all([getLiveAttendance(), getTodayStaffAttendance(), getAttendanceStats()]);
            setLiveAttendance((liveRes?.data || []).filter(a => a.type === 'Staff'));
            setTodayAttendance(todayRes?.data || []);
            setAttendanceStats(statsRes || { currentlyIn: 0, totalToday: 0, membersToday: 0, staffToday: 0 });
        } catch (err) { } finally { setAttendanceLoading(false); }
    }, []);

    useEffect(() => { loadStaff(); }, [loadStaff]);
    useEffect(() => { if (activeTab === 'Payroll') loadPayroll(); }, [activeTab, loadPayroll]);
    useEffect(() => { if (activeTab === 'Attendance') loadAttendance(); }, [activeTab, loadAttendance]);

    const handleSyncToMips = async (staffId) => {
        try {
            toast.loading('Syncing Hardware...', { id: 'mips' });
            await syncStaffToMipsAPI(staffId);
            toast.success('Synced!', { id: 'mips' });
            loadStaff();
        } catch (error) { toast.error('Sync Failed', { id: 'mips' }); }
    };

    const handleViewPayslip = async (payrollId, staffName, month, year) => {
        try {
            toast.loading('Preparing Payslip...', { id: 'payslip' });
            const blob = await downloadPayslipAPI(payrollId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${staffName.replace(/\s+/g, '_')}_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('Downloaded!', { id: 'payslip' });
        } catch (error) {
            toast.error('Failed to download payslip', { id: 'payslip' });
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
        try {
            toast.loading('Deleting...', { id: 'delPayroll' });
            await deletePayrollAPI(id);
            toast.success('Deleted!', { id: 'delPayroll' });
            loadPayroll();
        } catch (err) { toast.error('Failed to delete', { id: 'delPayroll' }); }
    };

    const filteredStaff = staffList.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMonthlyPayroll = staffList.reduce((acc, s) => acc + (parseFloat(s.baseSalary) || 0), 0);
    const [selectedMonth, setSelectedMonth] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; });
    const filteredPayroll = payrollHistory.filter(p => { const [yr, mo] = selectedMonth.split('-'); return p.year === parseInt(yr) && p.month === parseInt(mo); });
    const allSelected = staffList.length > 0 && selectedStaffIds.length === staffList.length;

    const StatusBadge = ({ status }) => {
        let colors = { background: '#F1F5F9', color: '#64748B' };
        if (['Active', 'checked-in', 'Processed'].includes(status)) colors = { background: '#ECFDF5', color: T.success };
        if (status === 'Pending') colors = { background: '#FFFBEB', color: '#D97706' };
        if (status === 'Suspended') colors = { background: '#FEF2F2', color: T.error };
        return <span style={{ ...S.badge, ...colors }}>{status}</span>;
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>HR & Payroll</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Force management, attendance & payroll processing</p>
                </div>
                <button onClick={() => navigate('/hr/staff/create')} style={{ ...S.btn, background: T.accent, color: '#FFF' }}><Plus size={18} /> Add Employee</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: `2px solid ${T.border}` }}>
                {[
                    { n: 'Employees', i: Users },
                    { n: 'Contracts', i: FileText },
                    { n: 'Attendance', i: CalendarDays },
                    { n: 'Payroll', i: Banknote }
                ].map(tab => (
                    <button 
                        key={tab.n} 
                        onClick={() => setActiveTab(tab.n)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '16px 24px', border: 'none', 
                            borderBottom: activeTab === tab.n ? `3px solid ${T.accent}` : '3px solid transparent', 
                            background: 'transparent', 
                            color: activeTab === tab.n ? T.accent : T.muted, 
                            fontSize: '13px', fontWeight: '800', 
                            cursor: 'pointer', transition: 'all 0.2s', 
                            textTransform: 'uppercase', marginBottom: '-2px' 
                        }}
                    >
                        <tab.i size={16} strokeWidth={activeTab === tab.n ? 2.5 : 2} />
                        {tab.n}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {activeTab === 'Attendance' ? (
                    <>
                        <StatItem label="On Duty" value={liveAttendance.length} icon={Users} color="#10B981" />
                        <StatItem label="Check-ins Today" value={todayAttendance.length} icon={CheckCircle} color="#3B82F6" />
                        <StatItem label="Closed Shifts" value={todayAttendance.filter(a => a.status === 'checked-out').length} icon={Clock} color="#6366F1" />
                        <StatItem label="Staff Total" value={staffList.length} icon={UserCircle} color="#7C3AED" />
                    </>
                ) : (
                    <>
                        <StatItem label="Employees" value={staffList.length} icon={Users} color={T.accent} />
                        <StatItem label="Active" value={staffList.filter(s => s.status === 'Active').length} icon={CheckCircle} color={T.success} />
                        <StatItem label="Contracts" value={staffList.filter(s => parseFloat(s.baseSalary) > 0).length} icon={FileText} color="#F59E0B" />
                        <StatItem label="Monthly Total" value={`₹${totalMonthlyPayroll.toLocaleString()}`} icon={Banknote} color="#8B5CF6" />
                    </>
                )}
            </div>

            {activeTab === 'Employees' && (
                <div style={S.card}>
                    <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Staff Directory</h3>
                         <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={{ ...S.input, width: '100%', paddingLeft: '48px' }} placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                         </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: T.bg }}>
                                    {['Employee', 'Position', 'Salary', 'Status', 'Hardware Sync', 'Actions'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '80px 0' }}><Loader message="Syncing HR Core..." /></td></tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '80px' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Users size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No staff matched filters</p></div></td></tr>
                                ) : (
                                    filteredStaff.map(staff => (
                                        <tr key={staff.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{staff.avatar ? <img src={staff.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={20} />}</div>
                                                    <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{staff.name}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>{staff.email}</p></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.bg, color: T.muted }}>{staff.role}</span></td>
                                            <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '800', color: T.text }}>₹{Number(staff.baseSalary || 0).toLocaleString()}</td>
                                            <td style={{ padding: '20px 24px' }}><StatusBadge status={staff.status || 'Active'} /></td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontSize: '9px', fontWeight: '900', color: staff.mipsSyncStatus === 'synced' ? T.success : '#D97706', textTransform: 'uppercase' }}>{staff.mipsSyncStatus || 'Pending'}</span>
                                                    <button onClick={() => handleSyncToMips(staff.id)} style={{ padding: 0, border: 'none', background: 'transparent', color: T.accent, fontSize: '9px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}>Sync Now</button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Payroll' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ ...S.card, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>Payroll Processing</h3><p style={{ fontSize: '12px', fontWeight: '600', color: T.muted, margin: '4px 0 0' }}>View and process monthly payroll for this branch</p></div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                             <input type="month" style={S.input} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
                             <button onClick={async () => {
                                const [yr, mo] = selectedMonth.split('-');
                                toast.promise(generatePayrollAPI(parseInt(yr), parseInt(mo), selectedStaffIds).then(res => { setSelectedStaffIds([]); loadPayroll(); return res; }), { loading: 'Processing Slips...', success: 'Payroll Done!', error: 'Failed' });
                             }} disabled={selectedStaffIds.length === 0} style={{ ...S.btn, background: selectedStaffIds.length === 0 ? T.bg : T.accent, color: selectedStaffIds.length === 0 ? T.subtle : '#FFF' }}>Generate for {selectedStaffIds.length} Selected</button>
                        </div>
                    </div>

                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} color="#D97706" />
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#D97706', margin: 0 }}>Select one or more employees from the table below, then click "Generate Payroll".</p>
                    </div>

                    <div style={S.card}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: T.bg }}>
                                        <th style={{ padding: '20px 24px' }}><input type="checkbox" checked={allSelected} onChange={() => { if (allSelected) setSelectedStaffIds([]); else setSelectedStaffIds(staffList.map(s => s.id)); }} /></th>
                                        {['Employee Name', 'Employee Code', 'Position', 'Base Salary', 'Attendance Days', 'Leave Days', 'Commission', 'Net Pay', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map(staff => {
                                        const pEntry = payrollHistory.find(p => p.staffId === staff.id && p.year === parseInt(selectedMonth.split('-')[0]) && p.month === parseInt(selectedMonth.split('-')[1]));
                                        const isProcessed = !!pEntry;
                                        
                                        return (
                                            <tr key={staff.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                                <td style={{ padding: '20px 24px' }}><input type="checkbox" checked={selectedStaffIds.includes(staff.id)} onChange={() => setSelectedStaffIds(prev => prev.includes(staff.id) ? prev.filter(id => id !== staff.id) : [...prev, staff.id])} /></td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                            {staff.avatar ? <img src={staff.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={20} />}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: '800', color: T.text }}>{staff.name}</span>
                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: T.muted }}>{staff.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: T.muted }}>{staff.memberId || `EMP-${String(staff.id).padStart(3, '0')}`}</td>
                                                <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.bg, color: T.muted }}>{staff.role}</span></td>
                                                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '800', color: T.text }}>₹{Number(staff.baseSalary || 0).toLocaleString()}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '700', color: T.text }}>{isProcessed ? (pEntry.attendanceDays || 0) : '--'}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '700', color: T.error }}>{isProcessed ? (pEntry.leaveDays || 0) : '--'}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '800', color: T.success }}>₹{isProcessed ? Number(pEntry.commission || 0).toLocaleString() : '--'}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '900', color: T.accent }}>{isProcessed ? `₹${Number(pEntry.amount).toLocaleString()}` : '₹--'}</td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <StatusBadge status={isProcessed ? 'Processed' : 'Not Generated'} />
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <button 
                                                            onClick={() => isProcessed ? handleViewPayslip(pEntry.id, staff.name, selectedMonth.split('-')[1], selectedMonth.split('-')[0]) : toast.error('Payroll not generated yet')} 
                                                            style={{ background: 'transparent', border: 'none', color: isProcessed ? T.accent : T.subtle, cursor: 'pointer', padding: '4px' }}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {isProcessed && (
                                                            <button 
                                                                onClick={() => handleDeletePayroll(pEntry.id)}
                                                                style={{ background: 'transparent', border: 'none', color: T.error, cursor: 'pointer', padding: '4px' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Contracts' && (
                <div style={S.card}>
                    <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Employment Contracts</h3>
                         <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={{ ...S.input, width: '100%', paddingLeft: '48px' }} placeholder="Search contracts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                         </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: T.bg }}>
                                    {['Employee', 'Position', 'Base Salary', 'Commission', 'Status', 'Action'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '80px 0' }}><Loader message="Loading Contracts..." /></td></tr>
                                ) : staffList.filter(s => parseFloat(s.baseSalary) > 0).length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '80px' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><FileText size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No active salary contracts found</p></div></td></tr>
                                ) : (
                                    staffList.filter(s => parseFloat(s.baseSalary) > 0).filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(staff => (
                                        <tr key={staff.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{staff.avatar ? <img src={staff.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={20} />}</div>
                                                    <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{staff.name}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>ID: {staff.memberId || 'STAFF-'+staff.id}</p></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.bg, color: T.muted }}>{staff.role}</span></td>
                                            <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '900', color: T.text }}>₹{Number(staff.baseSalary || 0).toLocaleString()}</td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ fontSize: '13px', fontWeight: '800', color: T.accent }}>{staff.commissionPercent || 0}%</span></td>
                                            <td style={{ padding: '20px 24px' }}><StatusBadge status={staff.status || 'Active'} /></td>
                                            <td style={{ padding: '20px 24px' }}><button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} style={{ ...S.btn, height: '32px', background: T.bg, color: T.muted }}>View Details</button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Attendance' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                     <div style={S.card}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Currently On Site</h3>
                            <button onClick={loadAttendance} style={{ ...S.btn, height: '36px', background: T.bg, color: T.muted }}><RefreshCw size={14} /> Refresh</button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: T.bg }}>
                                        {['Staff', 'Role', 'Check-in', 'Duration', 'Site Status'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveAttendance.length === 0 ? <tr><td colSpan="5" style={{ padding: '60px' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Clock size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No staff currently clocked in</p></div></td></tr> : liveAttendance.map(a => (
                                        <tr key={a.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{a.avatar ? <img src={a.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={20} />}</div>
                                                    <span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>{a.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.bg, color: T.muted }}>{a.role}</span></td>
                                            <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: T.text }}>{a.time}</td>
                                            <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '800', color: T.success }}>{a.duration || 'Just started'}</td>
                                            <td style={{ padding: '20px 24px' }}><StatusBadge status="checked-in" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

const StatItem = ({ label, value, icon: Icon, color }) => (
    <div style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: T.bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} /></div>
        <div><p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>{label}</p><p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{value}</p></div>
    </div>
);

export default Payroll;
