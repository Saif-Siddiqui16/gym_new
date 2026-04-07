import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
    Settings,
    Building2,
    MapPin,
    Gift,
    Users,
    FileText,
    Sparkles,
    DollarSign,
    Puzzle,
    Bell,
    Shield,
    Globe
} from 'lucide-react';

const SettingsLayout = ({ role }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const menuItems = [
        { name: 'Organization', path: `/branchadmin/settings/general`, icon: Building2 },
        { name: 'Branches', path: `/branchadmin/settings/branches`, icon: MapPin },
        { name: 'Amenities', path: `/branchadmin/settings/amenities`, icon: Gift },
        { name: 'Referrals', path: `/branchadmin/settings/referrals`, icon: Users },
        // { name: 'Templates', path: `/branchadmin/settings/templates`, icon: FileText },
        { name: 'Plan & Benefit Templates', path: `/branchadmin/settings/plan-benefit-templates`, icon: Sparkles },
        { name: 'Expenses', path: `/branchadmin/settings/expenses`, icon: DollarSign },
        { name: 'Integrations', path: `/branchadmin/settings/integrations`, icon: Puzzle },
        { name: 'Notifications', path: `/branchadmin/settings/communication`, icon: Bell },
        // { name: 'Security', path: `/branchadmin/settings/security`, icon: Shield },
        // { name: 'Website', path: `/branchadmin/settings/website`, icon: Globe },
    ];

    const T = {
        accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
        border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
        muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
        cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif"
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                .tab-active { background: ${T.accent} !important; border-color: ${T.accent} !important; color: #FFF !important; box-shadow: 0 8px 16px rgba(124, 92, 252, 0.25) !important; }
                .tab-inactive { background: #FFF !important; border-color: ${T.border} !important; color: ${T.muted} !important; }
                .tab-inactive:hover { border-color: ${T.accent} !important; color: ${T.accent} !important; background: ${T.accentLight} !important; }
            `}</style>

            <div style={{ 
                background: T.surface, 
                borderBottom: `1px solid ${T.border}`, 
                padding: '64px 32px 28px', 
                position: 'sticky', top: 0, zIndex: 1000,
                boxShadow: '0 4px 20px rgba(124, 92, 252, 0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ 
                            width: '52px', height: '52px', borderRadius: '18px', 
                            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: '#FFF', boxShadow: '0 8px 20px rgba(124, 92, 252, 0.3)'
                        }}>
                            <Settings size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0, letterSpacing: '-0.8px' }}>Settings</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.success, boxShadow: '0 0 10px rgba(0, 200, 83, 0.4)' }}></span>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>System Management</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {menuItems.map((item) => {
                        const isActive = currentPath === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={isActive ? 'tab-active' : 'tab-inactive'}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '12px 20px', borderRadius: '14px',
                                    border: '1.5px solid transparent',
                                    textDecoration: 'none', transition: 'all 0.2s ease',
                                    fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap'
                                }}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                <span style={{ letterSpacing: '0.1px' }}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div style={{ flex: 1, padding: '32px 28px' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <Outlet context={{ role }} />
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
