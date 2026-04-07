import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Bell, Clock, Play, Save, Loader, Sparkles, Inbox, Zap, CheckCircle2 } from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    toggleWrap: { width: 44, height: 24, borderRadius: 12, border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
    toggleDot: { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
};

const Notifications = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const { selectedBranch } = useBranchContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningReminders, setRunningReminders] = useState(false);

    const [emailSettings, setEmailSettings] = useState({ membershipReminders: true, paymentReceipts: true, classNotifications: true, announcements: true });
    const [systemSettings, setSystemSettings] = useState({ lowStockAlerts: true, newLeadAlerts: true, paymentAlerts: true, taskReminders: true });
    const [selectedReminderType, setSelectedReminderType] = useState('Payment Due');
    const reminderTypes = ['Payment Due', 'Birthdays', 'Membership Expiry', 'Class Reminders', 'PT Sessions', 'Benefit Bookings'];

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};
            const res = await apiClient.get('/admin/settings/notifications', { headers });
            if (res.data) {
                setEmailSettings({ membershipReminders: res.data.membershipReminders ?? true, paymentReceipts: res.data.paymentReceipts ?? true, classNotifications: res.data.classNotifications ?? true, announcements: res.data.announcements ?? true });
                setSystemSettings({ lowStockAlerts: res.data.lowStockAlerts ?? true, newLeadAlerts: res.data.newLeadAlerts ?? true, paymentAlerts: res.data.paymentAlerts ?? true, taskReminders: res.data.taskReminders ?? true });
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [selectedBranch]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const toggleSet = (type, key) => {
        if (isReadOnly) return;
        if (type === 'email') setEmailSettings(prev => ({ ...prev, [key]: !prev[key] }));
        else setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};
            await apiClient.patch('/admin/settings/notifications', { ...emailSettings, ...systemSettings }, { headers });
            toast.success('System preferences updated');
        } catch (error) { toast.error('Update failed'); } finally { setSaving(false); }
    };

    const handleRunReminders = async () => {
        if (isReadOnly) return;
        try {
            setRunningReminders(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};
            const res = await apiClient.post('/admin/settings/reminders/run', { type: selectedReminderType }, { headers });
            toast.success(res.data.message || `Triggered ${selectedReminderType}`);
        } catch (error) { toast.error('Engine error'); } finally { setRunningReminders(false); }
    };

    const Toggle = ({ active, onToggle }) => (
        <button onClick={onToggle} style={{ ...S.toggleWrap, background: active ? T.accent : T.subtle }}>
            <div style={{ ...S.toggleDot, left: active ? 23 : 3 }} />
        </button>
    );

    if (loading) return <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" style={{ color: T.accent }} size={40} /></div>;

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.2s }
            `}</style>

            {/* Premium Header Banner (Compact Version) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Bell size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Signal Control</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configure automated alerts and system transmissions</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving || isReadOnly}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s', opacity: saving ? 0.6 : 1
                    }}
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} {saving ? 'Syncing...' : 'Save Configuration'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }} className="fu1">
                {/* Email Notifications Block */}
                <div style={{ ...S.card, padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Outbound Mail</h2>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member communication triggers</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {[
                            { key: 'membershipReminders', title: 'Renewal Reminders', desc: 'Auto-transmit expiry alerts to members' },
                            { key: 'paymentReceipts', title: 'Transactional Receipts', desc: 'Securely dispatch payment confirmations' },
                            { key: 'classNotifications', title: 'Session Updates', desc: 'Confirm class bookings and trainer slots' },
                            { key: 'announcements', title: 'Global Bulletins', desc: 'Include branch in broadcast transmissions' }
                        ].map((m) => (
                            <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 900, color: T.text }}>{m.title}</h4>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.muted }}>{m.desc}</p>
                                </div>
                                <Toggle active={emailSettings[m.key]} onToggle={() => toggleSet('email', m.key)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Alerts Block */}
                <div style={{ ...S.card, padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Internal Signals</h2>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard event manifestations</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {[
                            { key: 'lowStockAlerts', title: 'Inventory Warning', desc: 'Notify admin when product stock depletes' },
                            { key: 'newLeadAlerts', title: 'Lead Manifestation', desc: 'Alert staff on new member inquiries' },
                            { key: 'paymentAlerts', title: 'Default Detection', desc: 'Flag overdue accounts on the dashboard' },
                            { key: 'taskReminders', title: 'Workflow Overdue', desc: 'Reminder for assigned staff objectives' }
                        ].map((m) => (
                            <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 900, color: T.text }}>{m.title}</h4>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.muted }}>{m.desc}</p>
                                </div>
                                <Toggle active={systemSettings[m.key]} onToggle={() => toggleSet('system', m.key)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* automated Engine Block */}
            <div style={{ ...S.card, padding: 40, marginBottom: 40 }} className="fu2">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: T.amberLight, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                         <Clock size={28} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: T.text }}>Engine Overrides</h2>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.muted, lineHeight: 1.6, maxWidth: 640 }}>
                            Manually trigger all pending system reminders (payments, birthdays, membership expiry, class/PT/benefit bookings). This utility overrides the scheduled cron cycles.
                        </p>
                        
                        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                            {reminderTypes.map(type => (
                                <button key={type} onClick={() => setSelectedReminderType(type)} style={{
                                    height: 48, padding: '0 24px', borderRadius: 16, border: selectedReminderType === type ? 'none' : `1.5px solid ${T.border}`,
                                    background: selectedReminderType === type ? T.text : '#fff', color: selectedReminderType === type ? '#fff' : T.muted,
                                    fontSize: 12, fontWeight: 900, cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>{type}</button>
                            ))}
                        </div>

                        <button onClick={handleRunReminders} disabled={runningReminders || isReadOnly} style={{
                            marginTop: 40, height: 60, padding: '0 36px', borderRadius: 20, background: T.bg, border: `2px solid ${T.accent}`, color: T.accent,
                            fontWeight: 900, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: '0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = T.accent + '10'}
                        onMouseOut={e => e.currentTarget.style.background = T.bg}
                        >
                            {runningReminders ? <Loader className="animate-spin" size={20} /> : <Play size={20} fill={T.accent} />} {runningReminders ? 'Running Cycles...' : 'Execute Manual Engine Trigger'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div style={{ height: 40 }} />
        </div>
    );
};

export default Notifications;
