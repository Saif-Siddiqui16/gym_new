import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, UserPlus, GitBranch, Clock } from 'lucide-react';

const CrmLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
        { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
        { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
    ];

    const isTrainerLeads = location.pathname === '/crm/my-leads';

    return (
        <div className="saas-container bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            <div className="max-w-[1400px] mx-auto">
                <header className="mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-5 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                    <Search size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
                                        {isTrainerLeads ? 'My Leads' : 'CRM & Sales'}
                                    </h1>
                                    <p className="text-slate-600 text-sm mt-1 font-medium">
                                        Manage walk-ins, track leads, and drive conversions.
                                    </p>
                                </div>
                            </div>

                            {!isTrainerLeads && (
                                <nav className="flex items-center gap-2 p-1.5 bg-slate-50/50 rounded-[20px] border border-slate-100 shadow-inner overflow-x-auto scrollbar-hide">
                                    {tabs.map((tab) => {
                                        const isActive = location.pathname === tab.path;
                                        return (
                                            <button
                                                key={tab.path}
                                                onClick={() => navigate(tab.path)}
                                                className={`
                                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200'
                                                        : 'text-slate-400 hover:text-violet-600 hover:bg-white'
                                                    }
                                                `}
                                            >
                                                <tab.icon size={16} />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            )}
                        </div>
                    </div>
                </header>

                <main className="saas-section">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CrmLayout;
