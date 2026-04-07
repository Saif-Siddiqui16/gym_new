import React, { useState, useEffect } from 'react';
import { Cake, Send, Ghost, Star, Calendar, Bell, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerBirthdayCheck, triggerPersonalBirthdayWish } from '../../api/manager/managerApi';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

const Birthdays = () => {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [sendingPersonalTo, setSendingPersonalTo] = useState(null);

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        try {
            setLoading(true);
            const data = await triggerBirthdayCheck();
            setBirthdays(data.wishes || []);
        } catch (error) {
            console.error("Failed to fetch birthdays:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendWishes = async () => {
        setProcessing(true);
        try {
            await triggerBirthdayCheck();
            toast.success('Birthday wishes sent successfully!');
            fetchBirthdays();
        } catch (error) {
            console.error("Failed to send wishes:", error);
        } finally {
            setProcessing(false);
        }
    };

    const sendPersonalMessage = async (memberId, name) => {
        const message = prompt(`Enter a personal birthday message for ${name}:`, `Happy Birthday ${name}! Have a fantastic day ahead.`);
        if (!message) return; // User cancelled

        setSendingPersonalTo(memberId);
        try {
            await triggerPersonalBirthdayWish(memberId, message);
            toast.success(`Personal message sent to ${name}!`);
        } catch (error) {
            console.error("Failed to send personal message:", error);
            toast.error("Failed to send personal message. Please try again later.");
        } finally {
            setSendingPersonalTo(null);
        }
    };

    return (
        <div style={{ background: T.bg, flex: 1, width: '100%', overflowY: 'auto', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
            `}</style>

            {/* Header Banner */}
            <div style={{ padding: '0 8px 30px' }} className="fu fu1">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                         <div style={{ width: 4, height: 32, background: T.rose, borderRadius: 4 }} />
                         <div>
                            <h1 style={{ fontSize: 36, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-1px' }}>Birthday Reminders</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                 <span style={{ fontSize: 10, fontWeight: 900, color: T.rose, background: T.roseLight, padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Celebration Hub</span>
                                 <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.subtle }} />
                                 <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: 0 }}>Automatic & Manual Greetings</p>
                            </div>
                         </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button 
                            onClick={fetchBirthdays}
                            style={{ width: 44, height: 44, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={sendWishes}
                            disabled={processing || birthdays.length === 0}
                            style={{ background: T.accent, color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 24px rgba(124,92,252,0.22)', display: 'flex', alignItems: 'center', gap: 10, opacity: (processing || birthdays.length === 0) ? 0.6 : 1 }}
                        >
                            <Send size={20} /> {processing ? 'Sending...' : 'Send All Wishes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="fu fu2">
                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <Loader2 size={40} className="animate-spin" style={{ color: T.accent, margin: '0 auto 16px' }} />
                        <p style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Checking guest list...</p>
                    </div>
                ) : birthdays.length === 0 ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                             <Ghost size={48} color={T.subtle} style={{ opacity: 0.5 }} />
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Birthdays Today</h3>
                        <p style={{ fontSize: 13, color: T.muted, margin: '8px 0 0' }}>Check back tomorrow! The system automatically sends wishes at midnight.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {birthdays.map((member, i) => (
                            <div key={member.id} style={{ background: T.surface, padding: 28, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: '0.3s', position: 'relative', overflow: 'hidden' }} className="member-card">
                                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.03 }}>
                                    <Cake size={120} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', itemsCenter: 'center', textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, margin: '0 auto 20px', borderRadius: 24, background: `linear-gradient(135deg, ${T.rose}, ${T.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 900, boxShadow: '0 8px 30px rgba(244,63,94,0.3)' }}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{member.name}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                                        <span style={{ fontSize: 9, fontWeight: 900, color: T.rose, background: T.roseLight, padding: '4px 12px', borderRadius: 10, textTransform: 'uppercase' }}>Today</span>
                                        <span style={{ fontSize: 9, fontWeight: 900, color: T.green, background: T.greenLight, padding: '4px 12px', borderRadius: 10, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={10} /> Notified</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => sendPersonalMessage(member.id, member.name)}
                                        disabled={sendingPersonalTo === member.id}
                                        style={{ width: '100%', marginTop: 28, height: 48, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', transition: '0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.background = T.rose; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = T.rose; }}
                                        onMouseOut={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
                                    >
                                        {sendingPersonalTo === member.id ? 'Sending...' : 'Send Personal Wish'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Automation Roster */}
            <div style={{ marginTop: 40, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, borderRadius: 32, padding: 32, color: '#fff', position: 'relative', overflow: 'hidden' }} className="fu fu3">
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', blur: '40px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Automation is Active</h3>
                        <p style={{ fontSize: 13, fontWeight: 500, margin: '6px 0 0', color: 'rgba(255,255,255,0.8)' }}>Members receive an automated greeting every 24 hours at midnight.</p>
                    </div>
                    <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>Next Cycle</div>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>Daily @ Midnight</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Birthdays;

