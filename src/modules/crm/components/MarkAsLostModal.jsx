import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
};

const S = {
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
};

const MarkAsLostModal = ({ isOpen, onClose, onConfirm, submitting }) => {
    const [reason, setReason] = useState('');

    const reasons = [
        'Too Expensive',
        'No Response',
        'Joined Other Gym',
        'Not Interested',
        'Other'
    ];

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Mark as Lost"
            subtitle="Please provide a reason"
            maxWidth="500px"
            footer={
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ ...S.btn, background: '#FFF', border: `2px solid ${T.border}`, color: T.text }}>Cancel</button>
                    <button 
                        onClick={() => onConfirm(reason)} 
                        disabled={!reason || submitting} 
                        style={{ ...S.btn, background: T.error, color: '#FFF' }}
                    >
                        {submitting ? 'Processing...' : 'Confirm Lost'}
                    </button>
                </div>
            }
        >
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', display: 'flex', gap: '12px' }}>
                    <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#B91C1C', margin: 0 }}>
                        Marking this lead as lost will move it out of your active pipeline. You can still find it in the lead list later.
                    </p>
                </div>

                <div>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Select Reason</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {reasons.map((r) => (
                            <button
                                key={r}
                                onClick={() => setReason(r)}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '16px', border: `2px solid ${reason === r ? T.error : T.border}`,
                                    background: reason === r ? '#FFF5F5' : '#FFF', color: reason === r ? T.error : T.text,
                                    fontSize: '14px', fontWeight: '700', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                {r}
                                {reason === r && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.error }}></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default MarkAsLostModal;
