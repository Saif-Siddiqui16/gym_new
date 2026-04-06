import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Clock, CreditCard, ArrowLeft, AlertCircle, Shield, Ban, Dumbbell, Gift, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchBookingSettings, updateBookingSettings } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
  green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  amber: '#F59E0B', amberLight: '#FEF3C7',
};

const BookingSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        globalBookingEnabled: true,
        creditsPerBooking: 1,
        maxBookingsPerDay: 2,
        maxBookingsPerWeek: 10,
        classCancellationWindow: 4,
        classAdvanceBookingDays: 7,
        benefitCancellationWindow: 24,
        benefitAdvanceBookingDays: 14,
        penaltyEnabled: true,
        penaltyCredits: 1
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchBookingSettings();
                setSettings(prev => ({ ...prev, ...data }));
            } catch (error) { console.error(error); }
            finally { setFetching(false); }
        };
        loadSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateBookingSettings(settings);
            toast.success('Sync Protocol Manifested');
        } catch (error) { toast.error("Transmission Error"); }
        finally { setLoading(false); }
    };

    const inputStyle = (err) => ({
        width: '100%', padding: '12px 16px 12px 42px', background: T.surface, border: `1.5px solid ${err ? T.rose : T.border}`,
        borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: T.text, outline: 'none', transition: 'all 0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    });

    const Card = ({ children, style = {} }) => (
        <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)', ...style }}>
            {children}
        </div>
    );

    if (fetching) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>

            <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/superadmin/general-settings/general')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 10, color: T.muted, fontSize: 13, fontWeight: 800, cursor: 'pointer', marginBottom: 24, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.accent}
                    onMouseLeave={e => e.currentTarget.style.color = T.muted}
                >
                    <ArrowLeft size={18} /> BACK TO SECTOR HUB
                </button>

                {/* Header Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1A1533 0%, #2D274D 55%, #3F396D 100%)',
                    borderRadius: 24, padding: '24px 32px', boxShadow: '0 8px 32px rgba(13,10,31,0.28)',
                    display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32
                }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Calendar size={28} color={T.accent2} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Booking Settings</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontWeight: 600 }}>Configure cancellation windows and booking rules</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
                    
                    {/* Class Settings */}
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Dumbbell size={20} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Settings</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cancellation Window (Classes)</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="number" name="classCancellationWindow" value={settings.classCancellationWindow} onChange={handleChange} style={inputStyle()} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Hours</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Advance Booking (Classes)</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="number" name="classAdvanceBookingDays" value={settings.classAdvanceBookingDays} onChange={handleChange} style={inputStyle()} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Days</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Amenity Settings */}
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gift size={20} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amenity Settings</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cancellation Window (Benefits)</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={18} color={T.rose} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input type="number" name="benefitCancellationWindow" value={settings.benefitCancellationWindow} onChange={handleChange} style={{ ...inputStyle(), borderColor: T.roseLight }} onFocus={e => e.currentTarget.style.borderColor = T.rose} onBlur={e => e.currentTarget.style.borderColor = T.roseLight} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color: T.rose, textTransform: 'uppercase', opacity: 0.6 }}>Hours</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Advance Booking (Benefits)</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} color={T.rose} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input type="number" name="benefitAdvanceBookingDays" value={settings.benefitAdvanceBookingDays} onChange={handleChange} style={{ ...inputStyle(), borderColor: T.roseLight }} onFocus={e => e.currentTarget.style.borderColor = T.rose} onBlur={e => e.currentTarget.style.borderColor = T.roseLight} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color: T.rose, textTransform: 'uppercase', opacity: 0.6 }}>Days</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Penalty Settings */}
                    <Card style={{ border: `2px solid ${T.accentMid}`, background: T.accentLight + '20' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: T.surface, border: `1px solid ${T.accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                                    <Shield size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>Penalty Settings</h4>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, margin: '2px 0 0' }}>Configure late cancellation and no-show penalties</p>
                                </div>
                            </div>
                            <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                                <input type="checkbox" name="penaltyEnabled" checked={settings.penaltyEnabled} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ position: 'absolute', inset: 0, background: settings.penaltyEnabled ? T.accent : T.subtle, borderRadius: 20, transition: '0.2s' }} />
                                <div style={{ position: 'absolute', top: 3, left: settings.penaltyEnabled ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </label>
                        </div>

                        {settings.penaltyEnabled && (
                            <div style={{ marginTop: 24, padding: 20, background: T.surface, borderRadius: 16, border: `1px solid ${T.accentMid}`, animation: 'fadeUp 0.3s forwards' }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 10 }}>Penalty Credits</label>
                                <div style={{ position: 'relative' }}>
                                    <AlertCircle size={18} color={T.accent} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="number" name="penaltyCredits" value={settings.penaltyCredits} onChange={handleChange} style={{ ...inputStyle(), background: T.bg }} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 900, color: T.accent, textTransform: 'uppercase' }}>Credits</span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Action Bar */}
                    <div style={{
                        marginTop: 10, display: 'flex', justifyContent: 'flex-end', padding: '24px 32px',
                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: 24, border: `1.5px solid ${T.accentMid}`,
                    }}>
                        <button
                            onClick={handleSave} disabled={loading}
                            style={{
                                padding: '14px 44px', borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, cursor: 'pointer', transition: '0.2s',
                                boxShadow: `0 8px 24px rgba(124,92,252,0.3)`, display: 'flex', alignItems: 'center', gap: 12, width: '100%'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Save size={20} strokeWidth={2.5} /> {loading ? 'Saving…' : 'SAVE SETTINGS'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingSettings;
