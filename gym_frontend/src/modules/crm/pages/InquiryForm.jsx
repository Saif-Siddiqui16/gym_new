import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Users, Calendar, Clock, MessageSquare, Target, UserPlus, Info } from 'lucide-react';
import { LEAD_SOURCES, INTERESTS } from '../data/mockCrmData';
import { ROLES } from '../../../config/roles';
import { useAuth } from '../../../context/AuthContext';
import { crmApi } from '../../../api/crm/crmApi';
import { fetchStaffAPI } from '../../../api/admin/adminApi';
import toast from 'react-hot-toast';

const InquiryForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const { user } = useAuth();

    // Use logged in user from context
    const loggedInUser = user || { role: '', id: '' };

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gender: '',
        age: '',
        interests: [],
        source: '',
        budgetRange: '',
        preferredContact: 'WhatsApp',
        assignedTo: loggedInUser.role === ROLES.TRAINER ? loggedInUser.id : '',
        followUpDate: '',
        followUpTime: '',
        notes: ''
    });

    // Load real staff list for Assign To dropdown
    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await fetchStaffAPI();
                setStaffList(Array.isArray(data) ? data : []);
            } catch (err) {
                // Silently fail — dropdown will just show current user only
                console.error('Could not load staff list:', err);
            }
        };
        loadStaff();
    }, []);

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await crmApi.createLead(formData);
            toast.success('Lead Created Successfully!');
            navigate('/crm/pipeline');
        } catch (error) {
            console.error('Failed to create lead:', error);
            toast.error(error.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="saas-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <UserPlus size={24} className="md:w-[28px] md:h-[28px]" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">New Walk-in Inquiry</h2>
                        <p className="text-slate-500 text-[11px] md:text-sm font-medium italic">Capture details for your next successful conversion.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    {/* STRICT UI ROW-BASED GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8">
                        {/* Row 1: Full Name & Phone */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Full Name *</label>
                            <input
                                required
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                placeholder="e.g. Rahul Sharma"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Phone Number *</label>
                            <input
                                required
                                type="tel"
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* Row 2: Email & Gender */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                placeholder="rahul@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Gender</label>
                            <select
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12 cursor-pointer"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Row 3: Age & Interested In */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Age</label>
                            <input
                                type="number"
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                placeholder="e.g. 25"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Interested In</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => handleInterestToggle(interest)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${formData.interests.includes(interest)
                                            ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100 scale-105'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 4: Source & Budget */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Lead Source</label>
                            <select
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12 cursor-pointer"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="">Select Source</option>
                                {LEAD_SOURCES.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Budget Range (Monthly)</label>
                            <input
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                placeholder="e.g. 3000-5000"
                                value={formData.budgetRange}
                                onChange={e => setFormData({ ...formData, budgetRange: e.target.value })}
                            />
                        </div>

                        {/* Row 5: Follow-up Date & Follow-up Time */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Follow-up Date *</label>
                            <input
                                required
                                type="date"
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                value={formData.followUpDate}
                                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Follow-up Time</label>
                            <input
                                type="time"
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12"
                                value={formData.followUpTime}
                                onChange={e => setFormData({ ...formData, followUpTime: e.target.value })}
                            />
                        </div>

                        {/* Row 6: Assign To & Preferred Contact */}
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Assign To</label>
                            <select
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12 cursor-pointer disabled:bg-slate-100"
                                disabled={loggedInUser.role === ROLES.TRAINER}
                                value={formData.assignedTo}
                                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                            >
                                <option value="">Unassigned</option>
                                {/* Self option first */}
                                {loggedInUser.id && (
                                    <option value={loggedInUser.id}>Self ({loggedInUser.name || 'Me'})</option>
                                )}
                                {/* Real staff from backend, excluding self */}
                                {staffList
                                    .filter(s => s.id !== loggedInUser.id)
                                    .map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.role === 'TRAINER' ? '🏋️ ' : '👤 '}{s.name} ({s.role.charAt(0) + s.role.slice(1).toLowerCase()})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Preferred Contact</label>
                            <select
                                className="saas-input rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-12 cursor-pointer"
                                value={formData.preferredContact}
                                onChange={e => setFormData({ ...formData, preferredContact: e.target.value })}
                            >
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Call">Phone Call</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>

                        {/* Row 7: Notes (Full Width) */}
                        <div className="saas-form-group lg:col-span-2">
                            <label className="saas-label uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2">Internal Notes</label>
                            <textarea
                                rows={4}
                                className="saas-input min-h-[120px] rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white pt-3"
                                placeholder="Add anything helpful for conversion..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="pt-8 md:pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 md:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/crm/pipeline')}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        >
                            Discard
                        </button>
                        <button
                            disabled={loading}
                            className={`
                                w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-violet-200/50 
                                hover:shadow-xl hover:shadow-violet-300/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3
                                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus size={16} />
                            )}
                            Save New Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Simple internal check circle icon since we forgot to import it
const CheckCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default InquiryForm;
