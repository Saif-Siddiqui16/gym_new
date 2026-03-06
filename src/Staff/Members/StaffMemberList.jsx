import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, User, Filter, Download, FileText,
    UserPlus, Users, CheckCircle, XCircle, Snowflake,
    Clock, Camera, Loader, RefreshCw
} from 'lucide-react';
import '../../styles/GlobalDesign.css';
import CustomDropdown from '../../components/common/CustomDropdown';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import RightDrawer from '../../components/common/RightDrawer';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';

const INPUT_CLASS = "w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none cursor-pointer`;

const EMPTY_FORM = {
    name: '', email: '', phone: '', gender: '', dob: '', source: 'Walk-in',
    referralCode: '', idType: '', idNumber: '', address: '',
    emergencyName: '', emergencyPhone: '', fitnessGoal: '', healthConditions: ''
};

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const STATUS_BADGE = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Inactive: 'bg-slate-50 text-slate-500 border-slate-100',
    Frozen: 'bg-blue-50 text-blue-600 border-blue-100',
    Expired: 'bg-rose-50 text-rose-600 border-rose-100',
};

const StaffMemberList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newMemberData, setNewMemberData] = useState(EMPTY_FORM);

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/staff/members');
            setMembers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Computed stats
    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'Active').length,
        inactive: members.filter(m => m.status === 'Inactive').length,
        frozen: members.filter(m => m.status === 'Frozen').length,
        expiring: members.filter(m => {
            if (!m.expiryDate) return false;
            const days = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 7;
        }).length,
    };

    // Filtered members
    const filtered = members.filter(m => {
        const matchSearch = !searchTerm ||
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.phone?.includes(searchTerm) ||
            m.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMemberData(p => ({ ...p, [name]: value }));
    };

    const handleAddMember = async () => {
        if (!newMemberData.name || !newMemberData.email || !newMemberData.phone) {
            toast.error('Name, email and phone are required');
            return;
        }
        try {
            setSaving(true);
            const res = await apiClient.post('/staff/members', newMemberData);
            toast.success(`Member "${res.data.name}" added successfully!`);
            setMembers(prev => [res.data, ...prev]);
            setIsAddDrawerOpen(false);
            setNewMemberData(EMPTY_FORM);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setSaving(false);
        }
    };

    const handleExportCSV = () => {
        if (filtered.length === 0) return toast.error('No data to export');
        const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Status', 'Join Date', 'Expiry'];
        const rows = filtered.map(m => [
            m.memberId, m.name, m.email, m.phone, m.status,
            m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : '—',
            m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN') : '—'
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-0 md:p-8 space-y-8 animate-fadeIn">

            {/* Header Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-2 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Members</h1>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                                    Manage your gym members and their memberships
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchMembers}
                                className="h-12 px-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-all shadow-sm"
                                title="Refresh"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => setIsAddDrawerOpen(true)}
                                className="flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:scale-105 transition-all"
                            >
                                <UserPlus size={18} /> Add Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard title="Total Members" value={loading ? '—' : stats.total} icon={Users} color="primary" isEarningsLayout={true} />
                <StatsCard title="Active" value={loading ? '—' : stats.active} icon={CheckCircle} color="success" isEarningsLayout={true} />
                <StatsCard title="Inactive" value={loading ? '—' : stats.inactive} icon={XCircle} color="danger" isEarningsLayout={true} />
                <StatsCard title="Frozen" value={loading ? '—' : stats.frozen} icon={Snowflake} color="secondary" isEarningsLayout={true} />
                <StatsCard title="Expiring Soon" value={loading ? '—' : stats.expiring} icon={Clock} color="warning" isEarningsLayout={true} />
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, phone, or member code..."
                        className="pl-12 h-14 w-full rounded-2xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                    />
                </div>
                <div className="w-full md:w-56">
                    <CustomDropdown
                        options={['All', 'Active', 'Inactive', 'Frozen', 'Expired']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="All Status"
                        icon={Filter}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="h-14 px-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 hover:border-violet-100 transition-all shadow-sm"
                        title="Export CSV"
                    >
                        <Download size={20} />
                    </button>
                    <button className="h-14 px-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 hover:border-violet-100 transition-all shadow-sm" title="Print">
                        <FileText size={20} />
                    </button>
                </div>
            </div>

            {/* Members List */}
            {loading ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-20 flex flex-col items-center gap-4">
                    <Loader size={40} className="animate-spin text-violet-400" />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading members...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 sm:p-20 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner">
                        <User size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">No members found</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
                            {searchTerm || statusFilter !== 'All' ? 'Try adjusting your filters' : 'Start by clicking the "Add Member" button'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-[2.5rem_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-8 py-4 bg-slate-50/80 border-b border-slate-100">
                        {['', 'Member', 'Email', 'Phone', 'Status', 'Joined'].map((h, i) => (
                            <div key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</div>
                        ))}
                    </div>
                    {/* Rows */}
                    <div className="divide-y divide-slate-50">
                        {filtered.map((m) => (
                            <div
                                key={m.id}
                                className="hidden md:grid grid-cols-[2.5rem_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-8 py-5 items-center hover:bg-slate-50/50 transition-colors group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 text-violet-600 flex items-center justify-center font-black text-sm">
                                    {getInitials(m.name)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors">{m.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.memberId}</p>
                                </div>
                                <p className="text-sm font-semibold text-slate-600 truncate">{m.email}</p>
                                <p className="text-sm font-semibold text-slate-600">{m.phone || '—'}</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_BADGE[m.status] || STATUS_BADGE.Inactive}`}>
                                    {m.status}
                                </span>
                                <p className="text-xs font-semibold text-slate-500">
                                    {m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </p>
                            </div>
                        ))}
                        {/* Mobile Cards */}
                        {filtered.map((m) => (
                            <div key={`mob-${m.id}`} className="md:hidden flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 text-violet-600 flex items-center justify-center font-black text-sm">
                                        {getInitials(m.name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{m.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">{m.memberId} · {m.phone}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_BADGE[m.status] || STATUS_BADGE.Inactive}`}>
                                    {m.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-8 py-4 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {filtered.length} of {members.length} members
                    </div>
                </div>
            )}

            {/* Add Member Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => { setIsAddDrawerOpen(false); setNewMemberData(EMPTY_FORM); }}
                title="Add New Member"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button
                            type="button"
                            onClick={() => { setIsAddDrawerOpen(false); setNewMemberData(EMPTY_FORM); }}
                            className="px-6 h-11 border-2 border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddMember}
                            disabled={saving}
                            className="px-6 h-11 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-60 flex items-center gap-2"
                        >
                            {saving && <Loader size={16} className="animate-spin" />}
                            Add Member
                        </button>
                    </div>
                }
            >
                <div className="px-6 py-6 space-y-8 pb-20">
                    {/* Profile Avatar */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-100">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl shadow-violet-100 transition-transform group-hover:scale-105">
                                {newMemberData.name ? getInitials(newMemberData.name) : 'N'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-lg border-2 border-slate-50 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all">
                                <Camera size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload photo</p>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
                                <input name="name" type="text" value={newMemberData.name} onChange={handleChange} placeholder="Enter full name" className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email *</label>
                                <input name="email" type="email" value={newMemberData.email} onChange={handleChange} placeholder="Enter email address" className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone *</label>
                                <input name="phone" type="tel" value={newMemberData.phone} onChange={handleChange} placeholder="+91 00000 00000" className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                                <select name="gender" value={newMemberData.gender} onChange={handleChange} className={SELECT_CLASS}>
                                    <option value="">Select gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date of Birth</label>
                                <input name="dob" type="date" value={newMemberData.dob} onChange={handleChange} className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Source</label>
                                <select name="source" value={newMemberData.source} onChange={handleChange} className={SELECT_CLASS}>
                                    <option>Walk-in</option>
                                    <option>Online</option>
                                    <option>Social Media</option>
                                    <option>Referral</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Referral */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Referral</h3>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Referral Code (Member Code)</label>
                            <div className="flex gap-2">
                                <input name="referralCode" type="text" value={newMemberData.referralCode} onChange={handleChange} placeholder="Enter member code" className={`flex-1 ${INPUT_CLASS}`} />
                                <button className="px-6 h-11 bg-white border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-violet-500 hover:text-violet-600 transition-all">
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Government ID */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Government ID</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">ID Type</label>
                                <select name="idType" value={newMemberData.idType} onChange={handleChange} className={SELECT_CLASS}>
                                    <option value="">Select ID Type</option>
                                    <option>Aadhaar Card</option>
                                    <option>PAN Card</option>
                                    <option>Driving License</option>
                                    <option>Passport</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">ID Number</label>
                                <input name="idNumber" type="text" value={newMemberData.idNumber} onChange={handleChange} placeholder="Enter ID number" className={INPUT_CLASS} />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Address</h3>
                        <textarea name="address" value={newMemberData.address} onChange={handleChange} placeholder="Enter full address" rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 resize-none"
                        />
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                                <input name="emergencyName" type="text" value={newMemberData.emergencyName} onChange={handleChange} placeholder="Emergency contact name" className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Emergency Phone</label>
                                <input name="emergencyPhone" type="tel" value={newMemberData.emergencyPhone} onChange={handleChange} placeholder="Emergency phone number" className={INPUT_CLASS} />
                            </div>
                        </div>
                    </div>

                    {/* Fitness & Health */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Fitness &amp; Health</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Fitness Goal</label>
                                <select name="fitnessGoal" value={newMemberData.fitnessGoal} onChange={handleChange} className={SELECT_CLASS}>
                                    <option value="">Select fitness goal</option>
                                    <option>Weight Loss</option>
                                    <option>Muscle Gain</option>
                                    <option>General Fitness</option>
                                    <option>Competition Prep</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Health Conditions</label>
                                <textarea name="healthConditions" value={newMemberData.healthConditions} onChange={handleChange} placeholder="Any medical conditions..." rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default StaffMemberList;
