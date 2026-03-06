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
        { name: 'Templates', path: `/branchadmin/settings/templates`, icon: FileText },
        { name: 'Plan & Benefit Templates', path: `/branchadmin/settings/plan-benefit-templates`, icon: Sparkles },
        { name: 'Expenses', path: `/branchadmin/settings/expenses`, icon: DollarSign },
        { name: 'Integrations', path: `/branchadmin/settings/integrations`, icon: Puzzle },
        { name: 'Notifications', path: `/branchadmin/settings/communication`, icon: Bell },
        { name: 'Security', path: `/branchadmin/settings/security`, icon: Shield },
        { name: 'Website', path: `/branchadmin/settings/website`, icon: Globe },
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-full bg-gradient-to-br from-slate-50 via-white to-violet-50/30 font-black">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white/80 backdrop-blur-md border-r border-slate-100 flex-shrink-0 lg:p-8 lg:min-h-full shadow-sm">
                <div className="p-6 lg:p-0 mb-8 lg:mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Settings size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Settings</h1>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Management</p>
                        </div>
                    </div>
                </div>

                <nav className="px-3 pb-6 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = currentPath === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary/5 text-primary shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                <div className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                                    }`}>
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-sm tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 bg-[#F8FAFC]">
                <main className="p-4 lg:p-8 max-w-6xl">
                    <Outlet context={{ role }} />
                </main>
            </div>
        </div>
    );
};

export default SettingsLayout;
