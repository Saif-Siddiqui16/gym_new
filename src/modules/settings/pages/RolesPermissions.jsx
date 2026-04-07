import React from 'react';
import { Shield, Check, X, Users, Lock, Edit2, AlertCircle, Plus } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4', amber: '#F59E0B', amberLight: '#FEF3C7',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    th: { padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderBottom: `1px solid ${T.bg}` },
    td: { padding: '14px 20px', fontSize: 13, color: T.text, fontWeight: 600, borderBottom: `1px solid ${T.bg}` }
};

const ROLES_MATRIX = [
    { role: 'Super Admin', users: 1, permissions: { members: true, finance: true, settings: true, reports: true } },
    { role: 'Branch Manager', users: 3, permissions: { members: true, finance: false, settings: false, reports: true } },
    { role: 'Trainer', users: 8, permissions: { members: true, finance: false, settings: false, reports: false } }
];

const RolesPermissions = () => {
    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '0 0 60px', fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
            `}</style>

            {/* Premium Header Banner (Matching White Aesthetic - Compact) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        <Shield size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Access Control</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Roles, Permissions & Security Hierarchies</p>
                    </div>
                </div>
                <button style={{ height: 48, padding: '0 24px', borderRadius: 14, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadow }}>
                    <Plus size={16} /> New Security Role
                </button>
            </div>

            {/* Matrix Card */}
            <div style={S.card} className="fu1">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                <th style={S.th}>Access Role</th>
                                <th style={{ ...S.th, textAlign: 'center' }}>Identity</th>
                                <th style={{ ...S.th, textAlign: 'center' }}>Finance</th>
                                <th style={{ ...S.th, textAlign: 'center' }}>Protocols</th>
                                <th style={{ ...S.th, textAlign: 'center' }}>Analytics</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROLES_MATRIX.map((role, idx) => (
                                <tr key={idx} style={{ transition: '0.2s' }} className="table-row">
                                    <td style={S.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Lock size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: T.text }}>{role.role}</div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>{role.users} Active Users</div>
                                            </div>
                                        </div>
                                    </td>
                                    {[
                                        role.permissions.members,
                                        role.permissions.finance,
                                        role.permissions.settings,
                                        role.permissions.reports
                                    ].map((perm, pIdx) => (
                                        <td key={pIdx} style={{ ...S.td, textAlign: 'center' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                                                width: 32, height: 32, borderRadius: 10,
                                                background: perm ? T.greenLight : T.roseLight,
                                                color: perm ? T.green : T.rose
                                            }}>
                                                {perm ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                                            </div>
                                        </td>
                                    ))}
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        <button style={{ height: 36, padding: '0 16px', borderRadius: 10, background: '#fff', border: `1.5px solid ${T.bg}`, color: T.text, fontSize: 11, fontWeight: 900, cursor: 'pointer', transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                            <Edit2 size={12} strokeWidth={2.5} /> Modify
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Propagation Note */}
            <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 18, background: T.amberLight, border: `1.5px solid ${T.amber}20`, display: 'flex', alignItems: 'center', gap: 14 }} className="fu2">
                <AlertCircle size={18} color={T.amber} strokeWidth={2.5} />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Permission changes propagate through the neural network within 300 seconds. Users may need to re-authenticate.
                </p>
            </div>
            <style>{`
                .table-row:hover { background: rgba(124, 92, 252, 0.02) !important; }
            `}</style>
        </div>
    );
};

export default RolesPermissions;

