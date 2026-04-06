import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Users, Plus, Search, Filter, MoreHorizontal, Mail, Phone,
    Award, Clock, DollarSign, TrendingUp, X, Check, Edit2, Trash2,
    Shield, ChevronDown, Camera, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import RightDrawer from '../../../components/common/RightDrawer';
import { useBranchContext } from '../../../context/BranchContext';
import { ROLES } from '../../../config/roles';
import * as managerApi from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
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

const Trainers = () => {
    const { selectedBranch } = useBranchContext();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [sortOption, setSortOption] = useState('All');
    const [filteredTrainers, setFilteredTrainers] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    // Stats state
    const [trainerKPIs, setTrainerKPIs] = useState({
        activeTrainers: 0, generalClients: 0, ptClients: 0, monthlyRevenue: 0, avgClientsPerTrainer: 0
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', gender: 'Male', idType: '', idNumber: '', specialization: '', certifications: '', salaryType: 'Monthly', baseSalary: '', hourlyRate: '', ptSharePercent: '', bio: '', status: 'Active', avatar: ''
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const [allStaff, trainerStats] = await Promise.all([
                managerApi.getAllStaff(branchId || 'all'),
                managerApi.getTrainerStats(branchId)
            ]);
            const trainerList = allStaff.filter(s => {
                const isTrainer = s.role === ROLES.TRAINER || s.role === 'TRAINER';
                const branchMatch = !branchId || s.tenantId === parseInt(branchId);
                return isTrainer && branchMatch;
            }).map(s => {
                let config = {};
                try { config = typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {}); } catch (e) { }
                return {
                    ...s, baseSalary: (s.baseSalary != null) ? Number(s.baseSalary) : null,
                    commissionPercent: s.commissionPercent ?? config.commission ?? config.commissionPercent ?? 0,
                    ptSharePercent: s.ptSharePercent ?? config.ptSharePercent ?? 0,
                    salaryType: config.salaryType || (s.hourlyRate > 0 ? 'Hourly' : 'Monthly'),
                    hourlyRate: s.hourlyRate || config.hourlyRate || 0
                };
            });
            setTrainers(trainerList);
            setTrainerKPIs({
                activeTrainers: trainerStats.activeTrainers || 0, generalClients: trainerStats.generalClients || 0, ptClients: trainerStats.ptClients || 0, monthlyRevenue: trainerStats.monthlyRevenue || 0, avgClientsPerTrainer: trainerStats.avgClientsPerTrainer || 0
            });
        } catch (error) { toast.error('Failed to load trainers data'); }
        finally { setLoading(false); }
    }, [selectedBranch]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        let result = trainers.filter(trainer => {
            const matchesSearch = (trainer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (trainer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = showInactive || trainer.status === 'Active';
            if (sortOption === 'Active Only') return matchesSearch && trainer.status === 'Active';
            if (sortOption === 'Inactive Only') return matchesSearch && trainer.status !== 'Active';
            return matchesSearch && matchesStatus;
        });
        setFilteredTrainers(result);
    }, [trainers, searchTerm, showInactive, sortOption]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, role: 'TRAINER', baseSalary: formData.salaryType === 'Monthly' ? formData.baseSalary : null, hourlyRate: formData.salaryType === 'Hourly' ? formData.hourlyRate : null };
            const branchId = selectedBranch === 'all' ? null : selectedBranch;
            if (editingTrainer) { await managerApi.updateStaffAPI(editingTrainer.id, payload); toast.success('Trainer updated'); }
            else { await managerApi.createStaffAPI(selectedBranch === 'all' ? { ...payload, branchId: 'all' } : { ...payload, tenantId: branchId }); toast.success('Trainer added'); }
            setIsDrawerOpen(false); resetForm(); loadData();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to save trainer'); }
    };

    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try { setConfirmModal(prev => ({ ...prev, loading: true })); await managerApi.deleteStaffAPI(confirmModal.id); toast.success('Trainer removed'); setConfirmModal({ isOpen: false, id: null, loading: false }); loadData(); }
        catch (error) { toast.error('Removal failed'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error('Image must be less than 2MB');
            const reader = new FileReader(); reader.onloadend = () => { setAvatarPreview(reader.result); setFormData({ ...formData, avatar: reader.result }); }; reader.readAsDataURL(file);
        }
    };

    const resetForm = () => { setFormData({ name: '', email: '', phone: '', gender: 'Male', idType: '', idNumber: '', specialization: '', certifications: '', salaryType: 'Monthly', baseSalary: '', hourlyRate: '', ptSharePercent: '', bio: '', status: 'Active', avatar: '' }); setAvatarPreview(null); setEditingTrainer(null); };

    const openEditDrawer = (trainer) => {
        setEditingTrainer(trainer);
        let parsedConfig = {};
        if (trainer.config) try { parsedConfig = typeof trainer.config === 'string' ? JSON.parse(trainer.config) : trainer.config; } catch (e) { }
        setFormData({ name: trainer.name || '', email: trainer.email || '', phone: trainer.phone || '', gender: parsedConfig.gender || trainer.gender || 'Male', idType: parsedConfig.idType || '', idNumber: parsedConfig.idNumber || '', specialization: parsedConfig.specialization || '', certifications: parsedConfig.certifications || '', salaryType: parsedConfig.salaryType || 'Monthly', baseSalary: trainer.baseSalary || '', hourlyRate: parsedConfig.hourlyRate || '', ptSharePercent: parsedConfig.ptSharePercent || '', bio: parsedConfig.bio || '', status: trainer.status || 'Active', avatar: trainer.avatar || '' });
        setAvatarPreview(trainer.avatar || null); setIsDrawerOpen(true);
    };

    const stats = [
        { label: 'Active Trainers', value: trainerKPIs.activeTrainers, icon: Users, color: T.accent, bg: T.accentLight },
        { label: 'General Clients', value: trainerKPIs.generalClients, icon: Shield, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'PT Clients', value: trainerKPIs.ptClients, icon: Award, color: '#d97706', bg: '#fffbeb' },
        { label: 'Monthly Rev', value: `₹${(trainerKPIs.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: T.success, bg: '#f0fdf4' },
        { label: 'Avg Clients', value: trainerKPIs.avgClientsPerTrainer, icon: TrendingUp, color: '#e11d48', bg: '#fff1f2' }
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.25)' }}><Users size={28} /></div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Trainers</h1>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Manage team, certifications & client assignments</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowInactive(!showInactive)} style={{ ...S.btn, background: showInactive ? T.text : '#FFF', color: showInactive ? '#FFF' : T.text, border: `1px solid ${T.border}` }}>{showInactive ? 'Show Active' : 'Show Inactive'}</button>
                    <button onClick={() => { resetForm(); setIsDrawerOpen(true); }} style={{ ...S.btn, background: T.accent, color: '#FFF', boxShadow: '0 10px 20px -5px rgba(124, 92, 252, 0.3)' }}><Plus size={18} /> Add Trainer</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '48px' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={22} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '22px', fontWeight: '900', color: T.text, margin: 0 }}>{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ ...S.card, overflow: 'visible' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CustomDropdown options={['All', 'Active Only', 'Inactive Only']} value={sortOption} onChange={setSortOption} placeholder="Sort Stats" icon={Filter} />
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search by name or email..." style={{ ...S.input, width: '100%', paddingLeft: '48px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Trainer Profile', 'Specialization', 'Contact Channels', 'Current Status', 'Earning Config', 'Action'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '80px 0' }}><Loader message="Fetching Trainers..." /></td></tr>
                            ) : filteredTrainers.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '80px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: T.subtle }}>No trainers found.</td></tr>
                            ) : filteredTrainers.map(trainer => (
                                <tr key={trainer.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', overflow: 'hidden' }}>
                                                {trainer.avatar ? <img src={trainer.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : trainer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{trainer.name}</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>ID #{trainer.id}</p></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '12px', fontWeight: '700', color: T.muted, background: T.bg, padding: '6px 12px', borderRadius: '10px' }}>{trainer.specialization || 'General Training'}</span></td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: T.muted, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {trainer.email}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: T.muted, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {trainer.phone}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ ...S.badge, background: trainer.status === 'Active' ? '#ecfdf5' : '#fff1f2', color: trainer.status === 'Active' ? T.success : T.error, border: `1px solid ${trainer.status === 'Active' ? '#d1fae5' : '#fee2e2'}` }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: trainer.status === 'Active' ? T.success : T.error, display: 'inline-block', marginRight: '6px' }} /> {trainer.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ padding: '8px 12px', background: T.bg, borderRadius: '12px', border: `1px solid ${T.border}`, width: 'fit-content' }}>
                                            {trainer.salaryType === 'Hourly' ? (
                                                <div><p style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>₹{trainer.hourlyRate}/hr</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.accent, margin: 0 }}>{trainer.ptSharePercent}% PT Share</p></div>
                                            ) : (
                                                <div><p style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>₹{Number(trainer.baseSalary || 0).toLocaleString()}</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>Monthly Base</p></div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openEditDrawer(trainer)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF', border: `1px solid ${T.border}`, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(trainer.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF', border: `1px solid ${T.border}`, color: T.error, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingTrainer ? "Edit Trainer" : "Add Trainer"} subtitle="Member of your staff team" width="450px">
                <form onSubmit={handleCreateOrUpdate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: T.bg, border: `2px dashed ${T.border}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            {avatarPreview ? <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color={T.subtle} />}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: T.muted, textTransform: 'uppercase' }}>Click to upload profile photo</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Name *</label><input required style={S.input} placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email *</label><input required type="email" style={S.input} placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phone *</label><input required style={S.input} placeholder="+91 ..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Gender</label><select style={{ ...S.input, width: '100%' }} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label><select style={{ ...S.input, width: '100%' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
                        </div>
                        <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Specialization</label><input style={S.input} placeholder="HIIT, Yoga, Strength" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Salary Type</label><select style={{ ...S.input, width: '100%' }} value={formData.salaryType} onChange={e => setFormData({ ...formData, salaryType: e.target.value })}><option>Monthly</option><option>Hourly</option></select></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{formData.salaryType === 'Monthly' ? 'Base Salary' : 'Hourly Rate'}</label><input type="number" style={S.input} placeholder="0" value={formData.salaryType === 'Monthly' ? formData.baseSalary : formData.hourlyRate} onChange={e => setFormData({ ...formData, [formData.salaryType === 'Monthly' ? 'baseSalary' : 'hourlyRate']: e.target.value })} /></div>
                        </div>
                        <div><label style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>PT Share %</label><input type="number" style={S.input} placeholder="40" value={formData.ptSharePercent} onChange={e => setFormData({ ...formData, ptSharePercent: e.target.value })} /></div>
                    </div>
                    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '450px', padding: '24px', background: '#FFF', borderTop: `1px solid ${T.bg}`, display: 'flex', gap: '12px', zIndex: 10 }}>
                        <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.muted }}>Cancel</button>
                        <button type="submit" style={{ ...S.btn, flex: 2, background: T.accent, color: '#FFF' }}><CheckCircle2 size={18} /> {editingTrainer ? 'Update' : 'Create'} Trainer</button>
                    </div>
                </form>
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Remove Trainer?" message="This trainer will be permanently removed from the system." confirmText="Remove" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default Trainers;
