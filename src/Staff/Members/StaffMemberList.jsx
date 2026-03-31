import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, User, Filter, Download, FileText,
    UserPlus, Users, CheckCircle2, XCircle, Snowflake,
    Clock, Camera, Loader, RefreshCw, Eye, MoreHorizontal,
    Building, Phone, Mail, Calendar, CreditCard,
    ChevronLeft, ChevronRight, ArrowUpCircle, Shield, LucideLayout, MapPin,
    ArrowRight,
    Play
} from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import RightDrawer from '../../components/common/RightDrawer';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { exportPdf } from '../../utils/exportPdf';

// API helpers specifically for Staff
const getStaffMembers = async () => (await apiClient.get('/staff/members')).data;
const getStaffMemberById = async (id) => (await apiClient.get(`/staff/members/${id}`)).data;

const INPUT_CLASS = "w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-slate-50/50";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none cursor-pointer`;

const EMPTY_FORM = {
    name: '', email: '', phone: '', gender: '', dob: '', source: 'Walk-in',
    referralCode: '', idType: '', idNumber: '', address: '',
    emergencyName: '', emergencyPhone: '', fitnessGoal: '', healthConditions: ''
};

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>;
    if (s === 'inactive') return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100">Inactive</span>;
    if (s === 'frozen') return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">Frozen</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100">{status || 'N/A'}</span>;
};

const getPlanBadge = (plan) => {
    const name = typeof plan === 'object' ? plan?.name : (plan || 'No Plan');
    if (name === 'No Plan') return <span className="text-xs font-bold text-slate-300">--</span>;
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{name}</span>
        </div>
    );
};

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
    const [newMemberData, setNewMemberData] = useState(EMPTY_FORM);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStaffMembers();
            // Calculate daysLeft for each member based on expiryDate
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

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Grouping stats
    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'Active').length,
        inactive: members.filter(m => m.status === 'Inactive').length,
        frozen: members.filter(m => m.status === 'Frozen').length,
        expiring: members.filter(m => m.daysLeft > 0 && m.daysLeft <= 7).length,
    };

    // Filter logic
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
            setSelectedMember(member); // Basic info first
            setIsViewDrawerOpen(true);
            setProfileActiveTab('Overview');
            
            // Rich data
            const data = await getStaffMemberById(member.id);
            setSelectedMember(data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberData.name || !newMemberData.email || !newMemberData.phone) {
            toast.error('Name, email and phone are required');
            return;
        }
        try {
            setSaving(true);
            const res = await apiClient.post('/staff/members', newMemberData);
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

    const handleExport = () => {
        if (filtered.length === 0) return toast.error('No members to export');
        const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Status', 'Join Date'];
        const rows = filtered.map(m => [
            m.memberId,
            m.name,
            m.email,
            m.phone,
            m.status,
            m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : '—'
        ]);

        exportPdf({
            title: 'Member List Report',
            filename: `members_${new Date().toISOString().split('T')[0]}`,
            headers,
            rows,
            gymName: "Gym Academy"
        });
    };

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="relative">
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Members</h1>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manage gym population & memberships</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchMembers} className="h-12 px-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={() => setIsAddDrawerOpen(true)} className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:scale-105 transition-all">
                                <UserPlus size={18} /> Add Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatsCard title="Total" value={stats.total} icon={Users} color="primary" isEarningsLayout={true} />
                <StatsCard title="Active" value={stats.active} icon={CheckCircle2} color="success" isEarningsLayout={true} />
                <StatsCard title="Inactive" value={stats.inactive} icon={XCircle} color="danger" isEarningsLayout={true} />
                <StatsCard title="Frozen" value={stats.frozen} icon={Snowflake} color="secondary" isEarningsLayout={true} />
                <StatsCard title="Expiring" value={stats.expiring} icon={Clock} color="warning" isEarningsLayout={true} />
            </div>

            {/* Search & Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search members..."
                        className="pl-12 h-14 w-full rounded-2xl border-2 border-slate-100 focus:border-primary text-sm font-semibold transition-all outline-none bg-slate-50/50" />
                </div>
                <div className="w-full md:w-56">
                    <CustomDropdown options={['All', 'Active', 'Inactive', 'Frozen', 'Expired']} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" icon={Filter} />
                </div>
                <button onClick={handleExport} className="h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                    <Download size={18} />
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            {['Member', 'Status', 'Plan', 'Days Left', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedMembers.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-primary flex items-center justify-center font-black text-sm">
                                            {getInitials(m.name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{m.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{m.memberId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">{getStatusBadge(m.status)}</td>
                                <td className="px-8 py-5">{getPlanBadge(m.plan)}</td>
                                <td className="px-8 py-5">
                                    <span className={`text-xs font-black ${m.daysLeft > 0 ? 'text-indigo-500' : 'text-slate-300'}`}>
                                        {m.daysLeft ? `${m.daysLeft}d` : '--'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-xs font-bold text-slate-500">
                                    {m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleView(m)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Detail Profile">
                                            <Eye size={20} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><MoreHorizontal size={20} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="px-8 py-5 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                        Showing {paginatedMembers.length} of {totalItems} members
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 rounded-xl bg-white border border-slate-100"><ChevronLeft size={16} /></button>
                        <span className="text-[10px] font-black text-slate-600">Page {currentPage}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalItems/itemsPerPage), p + 1))} className="p-2 rounded-xl bg-white border border-slate-100"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* View Member Detail Drawer (Rich Profile) */}
            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} maxWidth="max-w-2xl" hideHeader>
                {selectedMember && (
                    <div className="h-full flex flex-col bg-white">
                        {/* Drawer Hero */}
                        <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <button onClick={() => setIsViewDrawerOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"><XCircle size={20} /></button>
                            
                            <div className="relative flex items-center gap-6 mt-4">
                                <div className="shrink-0">
                                    {selectedMember.avatar ? (
                                        <img src={selectedMember.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-2xl" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white border-4 border-white/20 shadow-2xl">
                                            {getInitials(selectedMember.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-white tracking-tight">{selectedMember.name}</h2>
                                        {getStatusBadge(selectedMember.status)}
                                    </div>
                                    <p className="text-white/70 font-bold text-xs uppercase tracking-[0.2em]">{selectedMember.memberId}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-bold backdrop-blur-sm"><Mail size={12} /> {selectedMember.email}</div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-bold backdrop-blur-sm"><Phone size={12} /> {selectedMember.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-8 mt-6">
                            <div className="flex gap-8 border-b border-slate-100">
                                {['Overview', 'Plan', 'Benefits', 'Pay'].map(tab => (
                                    <button key={tab} onClick={() => setProfileActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${profileActiveTab === tab ? 'text-primary' : 'text-slate-400'}`}>
                                        {tab}
                                        {profileActiveTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-lg shadow-primary/30"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Stats Cards Row */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Days Left', value: selectedMember.daysLeft || '0', sub: selectedMember.planName || (typeof selectedMember.plan === 'object' ? selectedMember.plan?.name : selectedMember.plan) || 'No Plan', color: 'text-emerald-500' },
                                    { label: 'PT Sessions', value: '0', sub: 'PT Credits', color: 'text-slate-900' },
                                    { label: 'Visits', value: '0', sub: 'This Month', color: 'text-violet-600' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 text-center">
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.sub || stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {profileActiveTab === 'Overview' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><MapPin size={12} className="text-primary" /> Contact Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Address</span><p className="text-sm font-bold text-slate-700">{selectedMember.address || 'Not specified'}</p></div>
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</span><p className="text-sm font-bold text-slate-700">{selectedMember.emergencyName || 'N/A'} ({selectedMember.emergencyPhone || '—'})</p></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Shield size={12} className="text-primary" /> Fitness Profile</h4>
                                        <div className="space-y-4">
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Goal</span><div className="flex items-center gap-2 mt-1"><Play size={12} className="text-emerald-500" /><p className="text-sm font-black text-slate-700 uppercase italic tracking-tight">{selectedMember.fitnessGoal || 'General Fitness'}</p></div></div>
                                            <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical History</span><p className="text-xs font-bold text-slate-500">{selectedMember.healthConditions || 'None reported'}</p></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profileActiveTab === 'Plan' && (
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-2">Current Membership</h3>
                                            <p className="text-4xl font-black tracking-tight">{selectedMember.planName || 'Diamond Elite'}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light backdrop-blur-xl border border-white/20 shadow-xl shadow-black/20">
                                            <LucideLayout size={32} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8 mt-12 relative z-10">
                                        <div><span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Duration</span><p className="text-lg font-black">{selectedMember.plan?.duration || 30} Days</p></div>
                                        <div><span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Price</span><p className="text-lg font-black">₹{selectedMember.plan?.price || '0.00'}</p></div>
                                        <div><span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Type</span><p className="text-lg font-black uppercase italic tracking-tight">Active</p></div>
                                    </div>
                                </div>
                            )}

                            {profileActiveTab === 'Benefits' && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Membership Entitlements</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(() => {
                                            const rawBenefits = selectedMember.benefits || (selectedMember.plan && typeof selectedMember.plan === 'object' ? selectedMember.plan.benefits : null);
                                            let benefitsArray = [];
                                            try {
                                                if (rawBenefits) {
                                                    benefitsArray = typeof rawBenefits === 'string' ? JSON.parse(rawBenefits) : (Array.isArray(rawBenefits) ? rawBenefits : []);
                                                }
                                            } catch(e) { benefitsArray = []; }
                                            
                                            if (benefitsArray.length > 0) {
                                                return benefitsArray.map((b, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:border-primary/30 transition-all">
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900">
                                                            {typeof b === 'object' ? (b.name || b.label || `Access Item #${b.id || i}`) : b}
                                                            {b.limit && <span className="text-xs text-primary ml-1">({b.limit}x)</span>}
                                                        </span>
                                                    </div>
                                                ));
                                            }
                                            return (
                                                <div className="col-span-2 flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                    <Shield size={32} className="text-slate-200 mb-2" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard facilities included</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {profileActiveTab === 'Pay' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction History</h3>
                                        <button className="text-[10px] font-black uppercase text-primary tracking-widest">Generate Statement</button>
                                    </div>
                                    {selectedMember.invoices?.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedMember.invoices.map((inv, idx) => (
                                                <div key={idx} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center justify-between hover:border-slate-200 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-primary-light group-hover:text-primary">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">₹{inv.amount}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{inv.paymentMode || 'Cash'} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-300">
                                            <CreditCard size={32} className="mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No payment records found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Add Member Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => { setIsAddDrawerOpen(false); setNewMemberData(EMPTY_FORM); }}
                title="Register New Member"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end px-4">
                        <button type="button" onClick={() => setIsAddDrawerOpen(false)} className="px-8 h-12 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                        <button type="button" onClick={handleAddMember} disabled={saving} className="px-8 h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:scale-105 transition-all disabled:opacity-50">
                            {saving ? 'Creating...' : 'Register Member'}
                        </button>
                    </div>
                }
            >
                <div className="px-8 py-8 space-y-10 pb-24 overflow-y-auto">
                    <div className="flex flex-col items-center gap-4 py-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 relative group cursor-pointer overflow-hidden">
                        <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-white text-slate-300 flex items-center justify-center border-4 border-white shadow-xl transition-transform group-hover:scale-110">
                            <Camera size={40} />
                        </div>
                        <p className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture or Upload Avatar</p>
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest tracking-[0.2em]">Mandatory Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Full Name</label><input name="name" value={newMemberData.name} onChange={v => setNewMemberData(p=>({...p, name: v.target.value}))} placeholder="John Doe" className={INPUT_CLASS} /></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Phone Number</label><input name="phone" value={newMemberData.phone} onChange={v => setNewMemberData(p=>({...p, phone: v.target.value}))} placeholder="+91 00000 00000" className={INPUT_CLASS} /></div>
                            <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Email Address</label><input name="email" value={newMemberData.email} onChange={v => setNewMemberData(p=>({...p, email: v.target.value}))} placeholder="john@example.com" className={INPUT_CLASS} /></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-slate-200 rounded-full"></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest tracking-[0.2em]">Profile Info</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Gender</label><select name="gender" value={newMemberData.gender} onChange={v => setNewMemberData(p=>({...p, gender: v.target.value}))} className={SELECT_CLASS}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Birth Date</label><input name="dob" type="date" value={newMemberData.dob} onChange={v => setNewMemberData(p=>({...p, dob: v.target.value}))} className={INPUT_CLASS} /></div>
                            <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Physical Address</label><textarea className={`${INPUT_CLASS} h-24 py-3 resize-none`} placeholder="Current residential address" value={newMemberData.address} onChange={v => setNewMemberData(p=>({...p, address: v.target.value}))} /></div>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default StaffMemberList;
