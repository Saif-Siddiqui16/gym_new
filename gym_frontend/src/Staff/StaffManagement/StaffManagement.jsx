import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Filter, Plus, Mail, Phone, MoreHorizontal, Edit2, Trash2, ShieldCheck, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { fetchStaffAPI, } from '../../api/admin/adminApi';
import { deleteStaff } from '../../api/superadmin/superAdminApi';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';

const ROLE_PERMISSIONS = {
    'Admin': ['Full Access', 'Finance', 'HR', 'Settings', 'Branch Ops'],
    'Manager': ['Branch Ops', 'Finance', 'HR', 'Team Management'],
    'Trainer': ['Workouts', 'Sessions', 'Progress', 'Member Management'],
    'Staff': ['General Ops', 'Check-ins', 'Basic Member Support'],
};

// Confirmation Drawer Component (replaces ConfirmationModal)
const ConfirmationDrawer = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-sm"
            footer={
                <div className="flex gap-4 w-full p-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                    >
                        Confirm Delete
                    </button>
                </div>
            }
        >
            <div className="py-12 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
                    <Trash2 size={32} />
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                    {message}
                </p>
            </div>
        </RightDrawer>
    );
};

const StaffManagement = ({ role, branchId }) => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All Roles');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const data = await fetchStaffAPI();
            setStaffList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        navigate('/hr/staff/create');
    };

    const handleEdit = (id) => {
        navigate(`/hr/staff/edit/${id}`);
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (deleteModal.id) {
            await deleteStaff(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
            loadStaff();
        }
    };

    const roles = ['All Roles', ...Object.keys(ROLE_PERMISSIONS)];

    const filteredStaff = staffList.filter(s => {
        // Backend already scopes results by tenantId — no extra branchId filter needed
        const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.role || '').toLowerCase().includes(searchTerm.toLowerCase());
        const normalizedDBRole = (s.role || '').toUpperCase().replace(/_/g, ' ');
        const normalizedFilterRole = filterRole.toUpperCase();
        const matchesRole = filterRole === 'All Roles' || normalizedDBRole === normalizedFilterRole;
        const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const FilterContent = () => (
        <div className="space-y-6 flex-1">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Filter by Role</label>
                <div className="flex flex-wrap gap-2">
                    {roles.map(r => (
                        <button
                            key={r}
                            onClick={() => setFilterRole(r)}
                            className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all min-h-[44px] ${filterRole === r
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Account Status</label>
                <div className="flex gap-2">
                    {['All', 'Active', 'Inactive'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all min-h-[44px] ${filterStatus === s
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 min-h-screen p-6 md:p-8 font-sans pb-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <ShieldCheck className="text-indigo-600" size={32} />
                            Staff Management
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage branch employees, roles, and system access.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add New Staff
                    </button>
                </div>
            </div>

            {/* Desktop Filters & Search */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-sm font-medium h-14"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold hover:border-indigo-100 transition-all shadow-sm h-14"
                    >
                        <Filter size={20} /> Filters {(filterRole !== 'All Roles' || filterStatus !== 'All') && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                    </button>

                    <div className="hidden lg:flex items-center gap-4 bg-white/40 backdrop-blur-sm p-1 rounded-[28px] border-2 border-slate-100 overflow-x-auto custom-scrollbar h-14">
                        {roles.map(r => (
                            <button
                                key={r}
                                onClick={() => setFilterRole(r)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${filterRole === r
                                    ? 'bg-slate-900 text-white shadow-xl'
                                    : 'text-slate-400 hover:text-slate-800'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={loadStaff}
                        className="hidden lg:flex p-4.5 items-center justify-center bg-white border-2 border-slate-100 text-slate-400 rounded-[28px] hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm w-14 h-14"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* List/Table View */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/60 backdrop-blur-md rounded-[40px] shadow-sm border border-white/50 overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-7 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff Member</th>
                                    <th className="px-8 py-7 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Direct Access Roles</th>
                                    <th className="px-8 py-7 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact & Reach</th>
                                    <th className="px-8 py-7 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-7 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading && staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Team...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center text-slate-200 mb-4 opacity-50">
                                                    <UserX size={48} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Members Found</h3>
                                                <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">None of your team members match the current search or filter criteria. Try clearing them.</p>
                                                <button onClick={() => { setFilterRole('All Roles'); setFilterStatus('All'); setSearchTerm(''); }} className="mt-4 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Clear All Filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStaff.map(staff => (
                                    <tr key={staff.id} className="group hover:bg-white transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    {staff.role === 'Branch Manager' && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 border-2 border-white rounded-lg flex items-center justify-center text-white shadow-sm" title="Team Lead">
                                                            <ShieldCheck size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 flex items-center gap-2">
                                                        {staff.name}
                                                        {staff.role === 'Manager' && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded tracking-widest">Lead</span>}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        Joined: {staff.joinedDate} • Reports to: <span className="text-slate-600 font-extrabold">{staff.reportingManager || 'Owner'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                    {staff.role}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {ROLE_PERMISSIONS[staff.role]?.map(p => (
                                                        <span key={p} className="text-[8px] font-bold text-slate-400 uppercase border border-slate-100 px-1.5 py-0.5 rounded-md">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Mail size={12} className="text-slate-300" /> {staff.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Phone size={12} className="text-slate-300" /> {staff.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {staff.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button
                                                    onClick={() => handleEdit(staff.id)}
                                                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-50 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(staff.id)}
                                                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-50 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="group-hover:hidden text-slate-200">
                                                <MoreHorizontal size={20} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden p-4 space-y-4">
                        {loading && staffList.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Team...</span>
                                </div>
                            </div>
                        ) : filteredStaff.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                                <div className="flex flex-col items-center gap-4 p-8">
                                    <UserX size={48} className="text-slate-200" />
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">No Members Found</h3>
                                    <button onClick={() => { setFilterRole('All Roles'); setFilterStatus('All'); setSearchTerm(''); }} className="mt-4 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Clear Filters</button>
                                </div>
                            </div>
                        ) : (
                            filteredStaff.map(staff => (
                                <MobileCard
                                    key={staff.id}
                                    title={staff.name}
                                    subtitle={staff.role}
                                    badge={staff.status}
                                    badgeColor={staff.status === 'Active' ? 'emerald' : 'rose'}
                                    fields={[
                                        { label: 'Email', value: staff.email, icon: Mail },
                                        { label: 'Phone', value: staff.phone, icon: Phone }
                                    ]}
                                    actions={[
                                        {
                                            label: 'Edit',
                                            icon: Edit2,
                                            onClick: () => handleEdit(staff.id),
                                            variant: 'secondary'
                                        },
                                        {
                                            label: 'Delete',
                                            icon: Trash2,
                                            onClick: () => handleDelete(staff.id),
                                            variant: 'danger'
                                        }
                                    ]}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Drawer */}
            <ConfirmationDrawer
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Remove Team Member?"
                message="This action will terminate their system access immediately. This cannot be undone."
            />

            {/* Mobile Filter Drawer */}
            <RightDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                title="Filter Staff"
            >
                <div className="h-full flex flex-col p-6">
                    <FilterContent />
                    <button
                        onClick={() => setIsFilterDrawerOpen(false)}
                        className="w-full py-5 mt-8 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all h-14"
                    >
                        Apply Filters
                    </button>
                </div>
            </RightDrawer>
        </div>
    );
};

export default StaffManagement;
