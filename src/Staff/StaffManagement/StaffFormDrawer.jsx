import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Save, XCircle, Info, BadgeCheck, Briefcase } from 'lucide-react';
import { addStaff, editStaff } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const StaffFormDrawer = ({ isOpen, onClose, editId, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Receptionist',
        status: 'Active',
        reportingManager: '',
        permissions: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [staffList, setStaffList] = useState([]);

    // Roles aligned with StaffManagement.jsx permissions
    const roles = ['Admin', 'Manager', 'Trainer', 'Receptionist'];

    useEffect(() => {
        const loadStaffData = async () => {
            try {
                const { fetchStaff } = await import('../../api/superadmin/superAdminApi');
                const data = await fetchStaff();
                setStaffList(data);

                if (editId) {
                    const staffMember = data.find(s => s.id === editId);
                    if (staffMember) {
                        setFormData({
                            name: staffMember.name || '',
                            email: staffMember.email || '',
                            phone: staffMember.phone || '',
                            role: staffMember.role || 'Receptionist',
                            status: staffMember.status || 'Active',
                            reportingManager: staffMember.reportingManager || 'None',
                            permissions: staffMember.permissions || []
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load staff for drawer:', err);
            }
        };

        if (isOpen) {
            loadStaffData();
        }

        if (isOpen && !editId) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'Receptionist',
                status: 'Active',
                reportingManager: 'None',
                permissions: []
            });
        }
    }, [isOpen, editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editId) {
                await editStaff(editId, formData);
            } else {
                await addStaff(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Intro Section */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl relative z-10">
                        <User size={32} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            {editId ? 'Modify Staff' : 'Add New Staff'}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Role & Access Management</p>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <BadgeCheck size={18} className="text-indigo-600" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Personal Details</h4>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Name *</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="email@gym.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Phone Number *</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Access */}
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-2 px-2">
                        <Briefcase size={18} className="text-purple-600" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Work & Permissions</h4>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Assigned Role *</label>
                            <CustomDropdown
                                options={roles}
                                value={formData.role}
                                onChange={(val) => setFormData({ ...formData, role: val })}
                                placeholder="Select role"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Reporting Manager</label>
                            <CustomDropdown
                                options={['None', ...staffList.filter(s => s.id !== editId && (s.role === 'Branch Manager' || s.role === 'Manager')).map(s => s.name)]}
                                value={formData.reportingManager}
                                onChange={(val) => setFormData({ ...formData, reportingManager: val })}
                                placeholder="Select manager"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Account Status</label>
                            <div className="flex gap-4">
                                {['Active', 'Inactive'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${formData.status === s
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                                            : 'bg-slate-50 border-slate-50 text-slate-400'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 p-8 bg-white border-t border-slate-100 flex gap-4 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                >
                    <XCircle size={18} />
                    Discard
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Saving...' : (editId ? 'Update Profile' : 'Create Account')}
                </button>
            </div>
        </form>
    );
};

export default StaffFormDrawer;
