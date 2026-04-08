import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, User, Filter, Download, FileText,
    UserPlus, Users, CheckCircle2, XCircle, Snowflake,
    Clock, Camera, Loader, RefreshCw, Eye, MoreHorizontal,
    Building, Phone, Mail, Calendar, CreditCard,
    ChevronLeft, ChevronRight, ArrowUpCircle, Shield, LucideLayout, MapPin,
    ArrowRight, Play, X, Loader2, Save, Sparkles, ArrowRightLeft, History
} from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { exportPdf } from '../../utils/exportPdf';

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

const INPUT_STYLE = {
    width: '100%', height: 48, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
    background: '#F9F8FF', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
};

const SectionDivider = ({ title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 4, height: 24, borderRadius: 4, background: `linear-gradient(to bottom, ${T.accent}, ${T.accent2})` }} />
        <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
            {sub && <p style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2px 0 0' }}>{sub}</p>}
        </div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, color, bg, sub, index }) => {
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
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {sub && (
                    <div style={{ fontSize: 9, fontWeight: 900, color: color, background: bg, padding: '4px 8px', borderRadius: 20, textTransform: 'uppercase', border: `1px solid ${color}20` }}>
                        {sub}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
            </div>
        </div>
    );
};

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const StaffMemberList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [profileActiveTab, setProfileActiveTab] = useState('Overview');
    const fileInputRef = React.useRef(null);

    const [plans, setPlans] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [amenities, setAmenities] = useState([]);
    
    const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
    const [referralVerified, setReferralVerified] = useState(false);
    
    const EMPTY_FORM = {
        name: '', email: '', phone: '', gender: 'Male', dob: '', source: 'Walk-in',
        referralCode: '', idType: '', idNumber: '', address: '',
        emergencyName: '', emergencyPhone: '', fitnessGoal: '', healthConditions: '',
        planId: '', trainerId: '', startDate: new Date().toISOString().split('T')[0],
        benefits: [], avatar: null, duration: 1
    };

    const [newMemberData, setNewMemberData] = useState(EMPTY_FORM);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Membership Transfer State
    const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false);
    const [transferTargetMember, setTransferTargetMember] = useState(null);
    const [transferQuery, setTransferQuery] = useState('');
    const [transferResults, setTransferResults] = useState([]);
    const [isSearchingTarget, setIsSearchingTarget] = useState(false);
    const [branches, setBranches] = useState([]);
    const [transferToBranchId, setTransferToBranchId] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);


    const handleBenefitToggle = (id) => {
        setNewMemberData(prev => ({
            ...prev,
            benefits: prev.benefits.includes(id) 
                ? prev.benefits.filter(b => b !== id)
                : [...prev.benefits, id]
        }));
    };

    const handleVerifyReferral = async () => {
        if (!newMemberData.referralCode) {
            toast.error("Please enter a referral code to verify");
            return;
        }
        setIsVerifyingReferral(true);
        try {
            // Updated to use the correct API endpoint for referral verification
            const res = await apiClient.get(`/referrals/verify/${newMemberData.referralCode}`);
            if (res.data?.valid) {
                setReferralVerified(true);
                toast.success(`Code verified! Referrer: ${res.data.referrerName}`);
            } else {
                setReferralVerified(false);
                toast.error("Invalid or inactive referral code");
            }
        } catch (error) {
            setReferralVerified(false);
            toast.error(error?.response?.data?.message || "Failed to verify referral code");
        } finally {
            setIsVerifyingReferral(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMemberData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/staff/members');
            const data = res.data;
            const mapped = data.map(m => {
                let daysLeft = 0;
                if (m.expiryDate) {
                    const diff = new Date(m.expiryDate) - new Date();
                    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }
                return { ...m, daysLeft };
            });
            setMembers(mapped);
        } catch (err) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadExtraData = async () => {
        try {
            const [plansRes, amenitiesRes, staffRes, gymsRes] = await Promise.all([
                apiClient.get('/admin/plans'),
                apiClient.get('/amenities'),
                apiClient.get('/admin/staff'),
                apiClient.get('/superadmin/gyms').catch(() => ({ data: [] }))
            ]);
            setPlans(plansRes.data);
            setAmenities(amenitiesRes.data);
            setTrainers(staffRes.data.filter(s => s.role === 'TRAINER'));
            setBranches(gymsRes.data || []);
        } catch (err) {
            console.error('Failed to load extra data', err);
        }
    };


    useEffect(() => {
        fetchMembers();
        loadExtraData();
    }, [fetchMembers]);

    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'Active').length,
        inactive: members.filter(m => m.status === 'Inactive').length,
        frozen: members.filter(m => m.status === 'Frozen').length,
        expiring: members.filter(m => m.daysLeft > 0 && m.daysLeft <= 7).length,
    };

    const filtered = members.filter(m => {
        const matchSearch = !searchTerm ||
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.phone?.includes(searchTerm) ||
            m.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalItems = filtered.length;
    const paginatedMembers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleView = async (member) => {
        try {
            setSelectedMember(member);
            setIsViewDrawerOpen(true);
            setProfileActiveTab('Overview');
            const res = await apiClient.get(`/staff/members/${member.id}`);
            setSelectedMember({ ...member, ...res.data });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberData.name || !newMemberData.email || !newMemberData.phone) {
            toast.error('Name, email and phone are required');
            return;
        }
        if (!newMemberData.planId) {
            toast.error('Please select a membership plan');
            return;
        }
        try {
            setSaving(true);
            await apiClient.post('/staff/members', newMemberData);
            toast.success(`Member added successfully!`);
            fetchMembers();
            setIsAddDrawerOpen(false);
            setNewMemberData(EMPTY_FORM);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setSaving(false);
        }
    };

    const searchTargetMember = async (query) => {
        if (!query || query.length < 2) {
            setTransferResults([]);
            return;
        }
        setIsSearchingTarget(true);
        try {
            const res = await apiClient.get(`/staff/members/search?search=${query}`);
            // Filter out current member and those who already have active plans
            setTransferResults(res.data.filter(m => m.id !== selectedMember.id));
        } catch (err) {
            console.error('Failed to search receiver', err);
        } finally {
            setIsSearchingTarget(false);
        }
    };

    const handleTransferSubmit = async () => {
        if (!transferTargetMember) {
            toast.error('Please select a receiver member');
            return;
        }
        if (!confirm(`Are you sure you want to transfer ${selectedMember.name}'s membership to ${transferTargetMember.name}? ${selectedMember.name} will lose access immediately.`)) {
            return;
        }

        setIsTransferring(true);
        try {
            await apiClient.post('/staff/members/transfer', {
                fromMemberId: selectedMember.id,
                toMemberId: transferTargetMember.id,
                toBranchId: transferToBranchId,
                notes: transferNotes
            });
            toast.success('Membership transferred successfully!');
            setIsTransferDrawerOpen(false);
            setIsViewDrawerOpen(false);
            fetchMembers();
            // Reset state
            setTransferTargetMember(null);
            setTransferQuery('');
            setTransferResults([]);
            setTransferToBranchId('');
            setTransferNotes('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to transfer membership');
        } finally {
            setIsTransferring(false);
        }
    };


    const handleExport = () => {
        if (filtered.length === 0) return toast.error('No members to export');
        const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Status', 'Join Date'];
        const rows = filtered.map(m => [
            m.memberId, m.name, m.email, m.phone, m.status,
            m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : '—'
        ]);
        exportPdf({
            title: 'Member List Report',
            filename: `members_${new Date().toISOString().split('T')[0]}`,
            headers, rows, gymName: "Roar Fitness"
        });
    };

    const StatusBadge = ({ status }) => {
        const s = status?.toLowerCase();
        let color = T.muted, bg = T.bg;
        if (s === 'active') { color = T.green; bg = T.greenLight; }
        else if (s === 'inactive') { color = T.muted; bg = T.bg; }
        else if (s === 'frozen') { color = T.blue; bg = T.blueLight; }
        else if (s === 'expired') { color = T.rose; bg = T.roseLight; }
        
        return (
            <div style={{ padding: '6px 14px', borderRadius: 20, background: bg, color: color, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${color}20`, display: 'inline-flex' }}>
                {status}
            </div>
        );
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both; }
                .animate-spin { animation: spin 1s linear infinite; }
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
                        <Users size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Members</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: '4px 0 0', fontWeight: 600 }}>Manage gym population & memberships</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 2 }}>
                    <button onClick={fetchMembers} style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}>
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsAddDrawerOpen(true)} style={{ padding: '0 24px', height: 48, borderRadius: 14, background: '#fff', color: T.accent, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        <UserPlus size={18} strokeWidth={2.5} /> Add Member
                    </button>
                </div>
            </div>

            {/* KPI STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, marginBottom: 40 }} className="fu">
                <MetricCard title="Total" value={stats.total} icon={Users} color={T.accent} bg={T.accentLight} index={0} />
                <MetricCard title="Active" value={stats.active} icon={CheckCircle2} color={T.green} bg={T.greenLight} index={1} />
                <MetricCard title="Inactive" value={stats.inactive} icon={XCircle} color={T.muted} bg={T.bg} index={2} />
                <MetricCard title="Frozen" value={stats.frozen} icon={Snowflake} color={T.blue} bg={T.blueLight} index={3} />
                <MetricCard title="Expiring" value={stats.expiring} icon={Clock} color={T.amber} bg={T.amberLight} sub="7 Days" index={4} />
            </div>

            {/* SEARCH & FILTERS */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 32, animationDelay: '0.2s' }} className="fu">
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} color={T.subtle} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Search members by name, ID or phone..." 
                        style={{ ...INPUT_STYLE, paddingLeft: 52 }}
                    />
                </div>
                <div style={{ width: 220 }}>
                    <CustomDropdown options={['All', 'Active', 'Inactive', 'Frozen', 'Expired']} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" icon={Filter} />
                </div>
                <button onClick={handleExport} style={{ width: 56, height: 48, borderRadius: 16, background: T.surface, border: `2px solid ${T.border}`, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}>
                    <Download size={20} />
                </button>
            </div>

            {/* MEMBER TABLE */}
            <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', animationDelay: '0.3s' }} className="fu">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F9F8FF', borderBottom: `1px solid ${T.border}` }}>
                            {['Member', 'Status', 'Plan', 'Days Left', 'Joined', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMembers.map((m, i) => (
                            <tr key={m.id} style={{ borderBottom: i < paginatedMembers.length - 1 ? `1px solid ${T.bg}` : 'none', transition: '0.2s' }}>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, overflow: 'hidden' }}>
                                            {m.avatar ? <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(m.name)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{m.name}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.memberId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 32px' }}><StatusBadge status={m.status} /></td>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                                        <span style={{ fontSize: 12, fontWeight: 800, color: T.text, textTransform: 'uppercase' }}>{m.plan?.name || m.planName || 'No Plan'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ fontSize: 12, fontWeight: 900, color: m.daysLeft < 5 ? T.rose : T.accent }}>{m.daysLeft}d</div>
                                </td>
                                <td style={{ padding: '20px 32px', fontSize: 12, fontWeight: 700, color: T.muted }}>
                                    {m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleView(m)} style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Eye size={18} />
                                        </button>
                                        <button style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, color: T.muted, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* PAGINATION */}
                <div style={{ padding: '20px 32px', background: '#F9F8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>
                        Showing {paginatedMembers.length} of {totalItems} members
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <span style={{ fontSize: 11, fontWeight: 900, color: T.text }}>Page {currentPage}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalItems/itemsPerPage), p + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* MEMBER DETAIL DRAWER */}
            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} maxWidth="max-w-2xl" hideHeader>
                {selectedMember && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.surface }}>
                        {/* HERO */}
                        <div style={{ 
                            height: 200, background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)', 
                            padding: 32, position: 'relative', overflow: 'hidden' 
                        }}>
                             <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                             <button onClick={() => setIsViewDrawerOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 40, position: 'relative', zIndex: 2 }}>
                                {selectedMember.avatar ? (
                                    <img src={selectedMember.avatar} style={{ width: 88, height: 88, borderRadius: 24, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }} />
                                ) : (
                                    <div style={{ width: 88, height: 88, borderRadius: 24, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', border: '4px solid rgba(255,255,255,0.2)' }}>
                                        {getInitials(selectedMember.name)}
                                    </div>
                                )}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{selectedMember.name}</h2>
                                        <StatusBadge status={selectedMember.status} />
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedMember.memberId}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>• Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* TABS */}
                        <div style={{ padding: '24px 32px 0', display: 'flex', gap: 32, borderBottom: `1px solid ${T.border}` }}>
                            {['Overview', 'Plan', 'Benefits', 'Payments'].map(tab => (
                                <button key={tab} onClick={() => setProfileActiveTab(tab)} style={{ padding: '0 0 16px', background: 'none', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', position: 'relative', color: profileActiveTab === tab ? T.accent : T.subtle }}>
                                    {tab}
                                    {profileActiveTab === tab && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, background: T.accent, borderRadius: '4px 4px 0 0' }} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
                            {profileActiveTab === 'Overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                        <div style={{ background: '#F9F8FF', padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                                            <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={12} color={T.accent} /> Contact Detail</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Email</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selectedMember.email}</div></div>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Phone</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selectedMember.phone}</div></div>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Address</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selectedMember.address || '—'}</div></div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#F9F8FF', padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                                            <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={12} color={T.accent} /> Medical & Emergency</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Emergency</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selectedMember.emergencyName || '—'} ({selectedMember.emergencyPhone || '—'})</div></div>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Conditions</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selectedMember.healthConditions || 'None'}</div></div>
                                                <div><div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Goal</div><div style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>{selectedMember.fitnessGoal || 'General'}</div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profileActiveTab === 'Plan' && (
                                <div style={{ background: T.text, padding: 32, borderRadius: 28, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Active Membership</div>
                                            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px' }}>{selectedMember.planName || 'Diamond Elite'}</div>
                                        </div>
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LucideLayout size={28} /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 40 }}>
                                        <div><div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duration</div><div style={{ fontSize: 16, fontWeight: 900 }}>{selectedMember.plan?.duration || 30} Days</div></div>
                                        <div><div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</div><div style={{ fontSize: 16, fontWeight: 900 }}>₹{selectedMember.plan?.price || '0.00'}</div></div>
                                        <div><div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sessions</div><div style={{ fontSize: 16, fontWeight: 900 }}>Unlimited</div></div>
                                    </div>
                                    
                                    {selectedMember.plan?.allowTransfer && selectedMember.status === 'Active' && (
                                        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <button 
                                                onClick={() => {
                                                    setTransferToBranchId(selectedMember.tenantId);
                                                    setIsTransferDrawerOpen(true);
                                                }}
                                                style={{ 
                                                    width: '100%', padding: '14px', borderRadius: 16, border: 'none', 
                                                    background: '#fff', color: T.accent, fontSize: 12, fontWeight: 900, 
                                                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                                    boxShadow: '0 8px 15px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <ArrowRightLeft size={18} /> Transfer Membership
                                            </button>
                                        </div>
                                    )}
                                </div>

                            )}

                            {profileActiveTab === 'Benefits' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {[
                                        'Gym Access (Anytime)', 'Locker Included', 'Steam & Sauna', 'Protein Shake (10% Off)', 'Group Classes', 'Body Assessment'
                                    ].map((b, i) => (
                                        <div key={i} style={{ padding: '16px 20px', background: '#F9F8FF', border: `1px solid ${T.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.greenLight, color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                                            <div style={{ fontSize: 12, fontWeight: 900, color: T.text }}>{b}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {profileActiveTab === 'Payments' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {selectedMember.invoices?.length > 0 ? selectedMember.invoices.map((inv, i) => (
                                        <div key={i} style={{ padding: '20px 24px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}><CreditCard size={20} /></div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{inv.amount}</div>
                                                    <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>{inv.paymentMode} • {new Date(inv.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '4px 12px', background: T.greenLight, color: T.green, fontSize: 9, fontWeight: 900, borderRadius: 20, textTransform: 'uppercase' }}>Paid</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: 40, textAlign: 'center', color: T.subtle, fontSize: 12, fontWeight: 700 }}>No transaction history found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* ADD MEMBER DRAWER */}
            <RightDrawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Member" maxWidth="max-w-2xl" hideHeader>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F9F8FF' }}>
                    {/* CUSTOM HEADER */}
                    <div style={{ padding: '32px 32px 24px', background: '#fff', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A202C', margin: 0 }}>Add New Member</h2>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Register a new member to the branch</p>
                        </div>
                        <button onClick={() => setIsAddDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer' }}><X size={24} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 32px' }}>
                        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                            
                            {/* AVATAR CENTERED */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <div onClick={() => fileInputRef.current?.click()} style={{ 
                                    width: 140, height: 140, borderRadius: '50%', background: '#EFEAFF', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    position: 'relative', cursor: 'pointer', overflow: 'visible' 
                                }}>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    {newMemberData.avatar ? (
                                        <img src={newMemberData.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: 48, fontWeight: 900, color: '#7C5CFC' }}>{newMemberData.name ? getInitials(newMemberData.name) : 'N'}</span>
                                    )}
                                    <div style={{ 
                                        position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, 
                                        borderRadius: '50%', background: '#7C5CFC', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', color: '#fff' 
                                    }}>
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#718096' }}>Click camera to upload photo</span>
                            </div>

                            {/* SECTION 1: BASIC INFORMATION */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7C5CFC', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>1</div>
                                    <h3 style={{ fontSize: 13, fontWeight: 900, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Basic Information</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Full Name <span style={{ color: '#E53E3E' }}>*</span></label>
                                        <input required style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.name} onChange={e => setNewMemberData({...newMemberData, name: e.target.value})} placeholder="Enter full name" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Email <span style={{ color: '#E53E3E' }}>*</span></label>
                                        <input required style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.email} onChange={e => setNewMemberData({...newMemberData, email: e.target.value})} placeholder="Enter email address" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Phone <span style={{ color: '#E53E3E' }}>*</span></label>
                                        <input required style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.phone} onChange={e => setNewMemberData({...newMemberData, phone: e.target.value})} placeholder="+91 00000 00000" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Gender</label>
                                        <select style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.gender} onChange={e => setNewMemberData({...newMemberData, gender: e.target.value})}>
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Date of Birth</label>
                                        <input type="date" style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.dob} onChange={e => setNewMemberData({...newMemberData, dob: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Source</label>
                                        <select style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.source} onChange={e => setNewMemberData({...newMemberData, source: e.target.value})}>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Online">Online</option>
                                            <option value="Referral">Referral</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: MEMBERSHIP PLAN */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7C5CFC', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>2</div>
                                    <h3 style={{ fontSize: 13, fontWeight: 900, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Membership Plan</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Assign Plan</label>
                                        <select style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.planId} onChange={e => setNewMemberData({...newMemberData, planId: e.target.value})}>
                                            <option value="">Select Plan</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Start Date</label>
                                            <input type="date" style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                                value={newMemberData.startDate} onChange={e => setNewMemberData({...newMemberData, startDate: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>Billing Cycles</label>
                                            <select style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                                value={newMemberData.duration} onChange={e => setNewMemberData({...newMemberData, duration: parseInt(e.target.value)})}>
                                                <option value="1">1 Cycle</option>
                                                <option value="3">3 Cycles</option>
                                                <option value="6">6 Cycles</option>
                                                <option value="12">12 Cycles</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: OTHER DETAILS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7C5CFC', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>3</div>
                                    <h3 style={{ fontSize: 13, fontWeight: 900, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Identification</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>ID Type</label>
                                        <input style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.idType} onChange={e => setNewMemberData({...newMemberData, idType: e.target.value})} placeholder="Aadhar/PAN etc" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 11, fontWeight: 800, color: '#4A5568', textTransform: 'uppercase' }}>ID Number</label>
                                        <input style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, color: '#2D3748', outline: 'none' }}
                                            value={newMemberData.idNumber} onChange={e => setNewMemberData({...newMemberData, idNumber: e.target.value})} placeholder="Enter ID number" />
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                                <button type="button" onClick={() => setIsAddDrawerOpen(false)} style={{ flex: 1, padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', background: '#fff', color: '#718096', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} style={{ flex: 2, padding: '16px', borderRadius: 16, border: 'none', background: '#7C5CFC', color: '#fff', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Registering...' : 'Register Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </RightDrawer>

            {/* MEMBERSHIP TRANSFER DRAWER */}
            <RightDrawer isOpen={isTransferDrawerOpen} onClose={() => setIsTransferDrawerOpen(false)} title="Transfer Membership" maxWidth="max-w-md" hideHeader>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F9F8FF' }}>
                    <div style={{ padding: '32px 32px 24px', background: '#fff', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A202C', margin: 0 }}>Transfer Membership</h2>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hand over active plan to another member</p>
                        </div>
                        <button onClick={() => setIsTransferDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer' }}><X size={24} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* CURRENT OWNER INFO */}
                            <div style={{ padding: 20, background: T.accentLight, borderRadius: 20, border: `1px solid ${T.accent}30` }}>
                                <div style={{ fontSize: 10, fontWeight: 900, color: T.accent, textTransform: 'uppercase', marginBottom: 12 }}>Current Owner</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>
                                        {selectedMember?.name ? getInitials(selectedMember.name) : 'A'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{selectedMember?.name}</div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>PLAN: {selectedMember?.planName || 'Active Plan'} ({selectedMember?.daysLeft} days remaining)</div>
                                    </div>
                                </div>
                            </div>

                            {/* SELECT RECEIVER */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <SectionDivider title="Transfer To" sub="Search for receiver" />
                                
                                {!transferTargetMember ? (
                                    <div style={{ position: 'relative' }}>
                                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            style={{ ...INPUT_STYLE, paddingLeft: 44 }} 
                                            placeholder="Member Name, ID or Phone..."
                                            value={transferQuery}
                                            onChange={(e) => {
                                                setTransferQuery(e.target.value);
                                                searchTargetMember(e.target.value);
                                            }}
                                        />
                                        
                                        {transferResults.length > 0 && (
                                            <div style={{ 
                                                position: 'absolute', top: '105%', left: 0, right: 0, 
                                                background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                                                border: `1px solid ${T.border}`, zIndex: 100, maxHeight: 240, overflowY: 'auto' 
                                            }}>
                                                {transferResults.map(m => (
                                                    <div 
                                                        key={m.id} 
                                                        onClick={() => {
                                                            setTransferTargetMember(m);
                                                            setTransferQuery('');
                                                            setTransferResults([]);
                                                        }}
                                                        style={{ 
                                                            padding: '12px 16px', borderBottom: `1px solid ${T.border}`, 
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                                            transition: '0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#F9F8FF'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                                                            {getInitials(m.name)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.name}</div>
                                                            <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>{m.memberId} • {m.phone || 'No Phone'}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {isSearchingTarget && (
                                             <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
                                                <Loader2 size={16} className="animate-spin text-accent" />
                                             </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ 
                                        padding: 20, background: '#fff', borderRadius: 24, border: `2px dashed ${T.accent}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>
                                                {getInitials(transferTargetMember.name)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{transferTargetMember.name}</div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Receiver (ID: {transferTargetMember.memberId})</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setTransferTargetMember(null)}
                                            style={{ background: T.roseLight, color: T.rose, border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* SELECT BRANCH */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Target Branch</label>
                                <select 
                                    style={{ ...INPUT_STYLE }}
                                    value={transferToBranchId}
                                    onChange={(e) => setTransferToBranchId(e.target.value)}
                                >
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} {selectedMember?.tenantId === b.id ? '(Current)' : ''}</option>
                                    ))}
                                    {branches.length === 0 && <option value={selectedMember?.tenantId}>Current Branch</option>}
                                </select>
                            </div>

                            {/* NOTES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Transfer Notes (Optional)</label>
                                <textarea 
                                    style={{ ...INPUT_STYLE, height: 100, padding: '16px 20px', resize: 'none' }}
                                    placeholder="Reason for transfer or special instructions..."
                                    value={transferNotes}
                                    onChange={(e) => setTransferNotes(e.target.value)}
                                />
                            </div>

                            {/* CONFIRMATION WARNING */}
                            {transferTargetMember && (
                                <div style={{ padding: '16px 20px', background: T.roseLight, borderRadius: 16, border: `1px solid ${T.rose}20`, display: 'flex', gap: 12 }}>
                                    <Shield size={20} color={T.rose} />
                                    <p style={{ fontSize: 12, color: T.rose, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                                        <b>Warning:</b> By confirming, {selectedMember.name}'s membership will be deactivated and transferred to {transferTargetMember.name}. This action cannot be reversed.
                                    </p>
                                </div>
                            )}

                            {/* FOOTER ACTIONS */}
                            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                                <button 
                                    onClick={() => setIsTransferDrawerOpen(false)}
                                    style={{ flex: 1, height: 52, borderRadius: 16, border: `2px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleTransferSubmit}
                                    disabled={isTransferring || !transferTargetMember}
                                    style={{ 
                                        flex: 2, height: 52, borderRadius: 16, border: 'none', background: T.accent, color: '#fff', 
                                        fontSize: 13, fontWeight: 900, textTransform: 'uppercase', cursor: transferTargetMember ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        opacity: transferTargetMember ? 1 : 0.6
                                    }}
                                >
                                    {isTransferring ? <Loader2 size={20} className="animate-spin" /> : <ArrowRightLeft size={18} />}
                                    {isTransferring ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};


export default StaffMemberList;
