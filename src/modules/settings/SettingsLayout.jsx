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

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-primary-light/30 font-black overflow-hidden">
            {/* Header and Top Tabs */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 flex-shrink-0 z-10">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg shadow-violet-200">
                            <Settings size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Settings</h1>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Management</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="px-6 pb-4">
                    <nav className="flex flex-wrap gap-2">
                        {menuItems.map((item) => {
                            const isActive = currentPath === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 group whitespace-nowrap ${isActive
                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-primary/30 hover:bg-primary/5 hover:text-primary shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <div className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                                        <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-xs tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 bg-[#F8FAFC] overflow-y-auto custom-scrollbar">
                <main className="p-4 lg:p-8 w-full">
                    <Outlet context={{ role }} />
                </main>
            </div>
        </div>
    );
};

export default SettingsLayout;
