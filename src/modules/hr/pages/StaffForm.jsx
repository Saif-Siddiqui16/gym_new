import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, UserPlus, ChevronLeft, Clock, Info, ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createStaffAPI, fetchStaffByIdAPI, updateStaffAPI, fetchAvailableUsersAPI, linkStaffAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../config/roles';

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
    label: { fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }
};

const StaffForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditMode = !!id;
    const isReadOnly = location.state?.readOnly || false;
    const { role: currentUserRole } = useAuth();
    const profileImageRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);

    const [formData, setFormData] = useState({ name: '', phone: '', email: '', gender: 'Male', branch: '', role: 'Staff', department: '', position: '', joiningDate: '', salaryType: 'Monthly', baseSalary: '', commission: '', bankName: '', accountNumber: '', ifsc: '', taxId: '' });
    const { branches, selectedBranch } = useBranchContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) fetchStaffDetails();
        else if (selectedBranch !== 'all' && !formData.branch) setFormData(prev => ({ ...prev, branch: selectedBranch }));
    }, [id, selectedBranch]);

    const fetchStaffDetails = async () => {
        try {
            const data = await fetchStaffByIdAPI(id);
            if (!data) return;
            let displayRole = data.role === 'BRANCH_ADMIN' ? 'Admin' : data.role;
            const formattedJoined = data.joinedDate ? new Date(data.joinedDate).toISOString().split('T')[0] : '';
            let configData = {};
            if (data.config) try { configData = typeof data.config === 'string' ? JSON.parse(data.config) : (data.config || {}); } catch { }
            setFormData({ name: data.name || '', phone: data.phone || '', email: data.email || '', gender: configData.gender || data.gender || 'Male', branch: data.tenantId || '', role: displayRole || 'Staff', department: data.department || '', position: configData.position || '', joiningDate: formattedJoined, salaryType: configData.salaryType || 'Monthly', baseSalary: (data.baseSalary ?? '').toString(), commission: (configData.commission ?? '').toString(), bankName: configData.bankName || '', accountNumber: data.accountNumber || '', ifsc: data.ifsc || '', taxId: configData.taxId || '' });
            if (data.avatar) setProfileImage({ data: data.avatar });
        } catch (error) { toast.error('Failed to load profile'); }
    };

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage({ name: file.name, type: file.type, data: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.branch) return toast.error('Missing required fields');
        setIsSubmitting(true);
        try {
            const payload = { ...formData, tenantId: formData.branch, avatar: profileImage ? profileImage.data : null };
            if (isEditMode) await updateStaffAPI(id, payload);
            else await createStaffAPI(payload);
            toast.success(isEditMode ? 'Profile updated!' : 'Staff created!');
            navigate('/hr/staff/management');
        } catch (error) { toast.error(error.response?.data?.message || 'Save failed'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: T.muted, fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase' }}><ArrowLeft size={14} /> Back to dashboard</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><UserPlus size={32} /></div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>{isEditMode ? 'Employee Profile' : 'New Onboarding'}</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Build workforce and configure payroll parameters</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ animation: 'slideUp 0.4s ease' }}>
                <div style={S.card}>
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', paddingBottom: '32px', borderBottom: `1px solid ${T.bg}` }}>
                             <div onClick={() => !isReadOnly && profileImageRef.current.click()} style={{ width: '120px', height: '120px', borderRadius: '32px', background: T.bg, border: `2px dashed ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isReadOnly ? 'default' : 'pointer', overflow: 'hidden', position: 'relative' }}>
                                {profileImage ? <img src={profileImage.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color={T.subtle} />}
                                <input type="file" ref={profileImageRef} hidden accept="image/*" onChange={handleImageChange} />
                             </div>
                             <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>{formData.name || 'Member Identity'}</h3>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted }}>Update profile photo and basics</p>
                             </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px' }}>Core Information</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                <div><label style={S.label}>Full Legal Name *</label><input required name="name" disabled={isReadOnly} style={S.input} value={formData.name} onChange={handleChange} /></div>
                                <div><label style={S.label}>Email Address *</label><input required type="email" name="email" disabled={isReadOnly} style={S.input} value={formData.email} onChange={handleChange} /></div>
                                <div><label style={S.label}>Contact Number</label><input name="phone" disabled={isReadOnly} style={S.input} value={formData.phone} onChange={handleChange} /></div>
                                <div><label style={S.label}>Branch Assignment *</label><select name="branch" disabled={isReadOnly} style={{ ...S.input, width: '100%' }} value={formData.branch} onChange={handleChange}><option value="">Select Branch</option>{branches.map(b => <option key={b.id} value={b.id}>{b.branchName || b.name}</option>)}</select></div>
                                <div><label style={S.label}>Designation / Role *</label><select name="role" disabled={isReadOnly} style={{ ...S.input, width: '100%' }} value={formData.role} onChange={handleChange}>{currentUserRole === ROLES.SUPER_ADMIN && <option value="Admin">Admin</option>}<option value="Manager">Manager</option><option value="Trainer">Trainer</option><option value="Staff">Staff</option></select></div>
                                <div><label style={S.label}>Department</label><input name="department" disabled={isReadOnly} style={S.input} value={formData.department} onChange={handleChange} /></div>
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px' }}>Employment & Payroll</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                <div><label style={S.label}>Salary Type</label><select name="salaryType" disabled={isReadOnly} style={{ ...S.input, width: '100%' }} value={formData.salaryType} onChange={handleChange}><option value="Monthly">Monthly</option><option value="Hourly">Hourly</option><option value="Weekly">Weekly</option></select></div>
                                <div><label style={S.label}>Base Amount (â‚¹)</label><input type="number" name="baseSalary" disabled={isReadOnly} style={S.input} value={formData.baseSalary} onChange={handleChange} /></div>
                                <div><label style={S.label}>Commission (%)</label><input type="number" name="commission" disabled={isReadOnly} style={S.input} value={formData.commission} onChange={handleChange} /></div>
                                <div><label style={S.label}>Joining Date</label><input type="date" name="joiningDate" disabled={isReadOnly} style={S.input} value={formData.joiningDate} onChange={handleChange} /></div>
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px' }}>Statutory & Banking</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                <div><label style={S.label}>Bank Name</label><input name="bankName" disabled={isReadOnly} style={S.input} value={formData.bankName} onChange={handleChange} /></div>
                                <div><label style={S.label}>Account Number</label><input name="accountNumber" disabled={isReadOnly} style={S.input} value={formData.accountNumber} onChange={handleChange} /></div>
                                <div><label style={S.label}>IFSC / Swift Code</label><input name="ifsc" disabled={isReadOnly} style={S.input} value={formData.ifsc} onChange={handleChange} /></div>
                                <div style={{ gridColumn: 'span 1' }}><label style={S.label}>PAN / Tax ID</label><input name="taxId" disabled={isReadOnly} style={S.input} value={formData.taxId} onChange={handleChange} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                    <button type="button" onClick={() => navigate(-1)} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}>Discard Changes</button>
                    {!isReadOnly && <button type="submit" disabled={isSubmitting} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '56px', padding: '0 40px', borderRadius: '18px' }}>{isSubmitting ? <><Clock size={20} /> COMMITTING...</> : <><Save size={20} /> SAVE PROFILE</>}</button>}
                </div>
            </form>
        </div>
    );
};

export default StaffForm;
