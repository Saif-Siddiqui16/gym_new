import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import RightDrawer from '../../../components/common/RightDrawer';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
};

const ConvertLeadModal = ({ isOpen, onClose, onConfirm, submitting, lead }) => {
    const { selectedBranch } = useBranchContext();
    const [plans, setPlans] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        planId: '',
        trainerId: '',
        paymentMethod: 'Cash',
        referralCode: ''
    });
    const [referrerInfo, setReferrerInfo] = useState(null);
    const [verifyingCode, setVerifyingCode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.referralCode) {
                verifyReferral(formData.referralCode);
            } else {
                setReferrerInfo(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.referralCode]);

    const verifyReferral = async (code) => {
        try {
            setVerifyingCode(true);
            const response = await apiClient.get(`/referrals/verify/${code}`);
            if (response.data.valid) {
                setReferrerInfo({ name: response.data.referrerName, valid: true });
            } else {
                setReferrerInfo({ name: 'Invalid code', valid: false });
            }
        } catch (error) {
            console.error('Verify code error:', error);
            setReferrerInfo({ name: 'Error verifying', valid: false });
        } finally {
            setVerifyingCode(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const headers = { 'x-tenant-id': selectedBranch };
            const [plansRes, trainersRes] = await Promise.all([
                apiClient.get('/admin/plans', { headers }),
                apiClient.get('/staff/team', { headers })
            ]);
            setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
            const allStaff = Array.isArray(trainersRes.data) ? trainersRes.data : [];
            setTrainers(allStaff.filter(s => s.role === 'TRAINER'));
        } catch (error) {
            console.error('Fetch conversion data error:', error);
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Convert to Member"
            subtitle={`Joining ${lead?.name}`}
            maxWidth="600px"
            footer={
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ ...S.btn, background: '#FFF', border: `2px solid ${T.border}`, color: T.text }}>Cancel</button>
                    <button 
                        onClick={() => onConfirm(formData)} 
                        disabled={!formData.planId || loadingData || submitting} 
                        style={{ ...S.btn, background: T.success, color: '#FFF' }}
                    >
                        {submitting ? 'Converting...' : 'Convert to Member'}
                    </button>
                </div>
            }
        >
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', p: '16px', background: T.bg, borderRadius: '16px', border: `1px solid ${T.border}` }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.success + '15', color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <CheckCircle size={20} />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: T.text, margin: 0 }}>You're converting {lead?.name} to an active member.</p>
                </div>

                <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Membership Plan *</label>
                    <select
                        value={formData.planId}
                        onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                        style={{ ...S.input, width: '100%', height: '54px' }}
                    >
                        <option value="">Select a plan</option>
                        {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Personal Trainer (Optional)</label>
                    <select
                        value={formData.trainerId}
                        onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                        style={{ ...S.input, width: '100%', height: '54px' }}
                    >
                        <option value="">Assign a trainer (None)</option>
                        {trainers.map(trainer => (
                            <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {['Cash', 'UPI', 'Card'].map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                style={{
                                    padding: '14px', borderRadius: '12px', border: `2px solid ${formData.paymentMethod === method ? T.accent : T.border}`,
                                    background: formData.paymentMethod === method ? T.accentLight : '#FFF',
                                    color: formData.paymentMethod === method ? T.accent : T.muted,
                                    fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer'
                                }}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ paddingTop: '16px', borderTop: `1px solid ${T.border}` }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Referral Code (Optional)</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Enter member code"
                            value={formData.referralCode}
                            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                            style={{ ...S.input, width: '100%', height: '54px' }}
                        />
                        {verifyingCode && (
                            <div style={{ position: 'absolute', right: '16px', top: '15px' }}>
                                <Loader2 className="animate-spin" size={20} color={T.accent} />
                            </div>
                        )}
                    </div>
                    {referrerInfo && (
                        <p style={{ fontSize: '10px', fontWeight: '800', color: referrerInfo.valid ? T.success : T.error, textTransform: 'uppercase', marginTop: '8px', paddingLeft: '4px' }}>
                             {referrerInfo.name}
                        </p>
                    )}
                </div>
            </div>
        </RightDrawer>
    );
};

export default ConvertLeadModal;
