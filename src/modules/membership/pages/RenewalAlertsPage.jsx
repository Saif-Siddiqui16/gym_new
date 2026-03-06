import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Phone,
    MessageCircle,
    RefreshCw,
    ChevronLeft,
    AlertCircle,
    User,
    Clock,
    ExternalLink,
    CheckCircle2
} from 'lucide-react';
import { getRenewalAlerts } from '../../../api/manager/managerApi';
import RenewalModal from '../components/RenewalModal';
import toast from 'react-hot-toast';

const RenewalAlertsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('expiring'); // 'expiring' or 'expired'
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getRenewalAlerts({ type: activeTab, search: searchTerm });
                setMembers(data);
            } catch (err) {
                console.error("Failed to load renewal alerts:", err);
                toast.error("Failed to load renewal alerts");
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, 300);
        return () => clearTimeout(debounce);
    }, [activeTab, searchTerm]);

    const getDaysDiff = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        const diffTime = date - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const filteredMembers = members;

    const handleRenewClick = (member) => {
        setSelectedMember(member);
        setIsRenewalModalOpen(true);
    };

    const handleCallMember = (member) => {
        alert(`Initiating call to ${member.memberName} at ${member.phone}...`);
        window.location.href = `tel:${member.phone}`;
    };

    const handleMessageMember = (member) => {
        alert(`Opening WhatsApp for ${member.memberName}...`);
        // Clean phone number for WhatsApp link
        const cleanPhone = member.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ChevronLeft size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Back</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                            <RefreshCw size={32} className="animate-spin-slow" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Renewal Alerts</h1>
                            <p className="text-slate-500 font-medium italic">Monitor and retain members before they leave.</p>
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setActiveTab('expiring')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expiring'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Expiring Soon
                        </button>
                        <button
                            onClick={() => setActiveTab('expired')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expired'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Recently Expired
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                            <input
                                type="text"
                                className="pl-11 h-12 w-full rounded-2xl border-2 border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-medium bg-white"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="px-5 h-12 flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <AlertCircle size={16} className={activeTab === 'expiring' ? 'text-amber-500' : 'text-rose-500'} />
                                {filteredMembers.length} Members Found
                            </div>
                        </div>
                    </div>

                    {/* Table / Cards */}
                    <div className="overflow-x-auto">
                        {/* Desktop Table View */}
                        <table className="w-full hidden lg:table">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Info</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Details</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Window</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-500">
                                                <RefreshCw size={40} className="animate-spin" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Loading data...</h3>
                                        </td>
                                    </tr>
                                ) : filteredMembers.length > 0 ? filteredMembers.map(member => (
                                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                        {/* ... member row content ... */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-violet-500 group-hover:text-white transition-all duration-500">
                                                    {member.memberName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{member.memberName}</p>
                                                    <p className="text-xs font-bold text-slate-400">{member.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{member.planName}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Joined: {member.joinDate}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${activeTab === 'expiring' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                                                    <p className={`text-sm font-black ${activeTab === 'expiring' ? 'text-amber-600' : 'text-rose-600'}`}>
                                                        {activeTab === 'expiring' ? `${getDaysDiff(member.endDate)} Days Left` : `Expired ${Math.abs(getDaysDiff(member.endDate))} Days Ago`}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-4">Ends: {member.endDate}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleMessageMember(member)}
                                                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
                                                    title="WhatsApp Member"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleCallMember(member)}
                                                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-200"
                                                    title="Call Member"
                                                >
                                                    <Phone size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRenewClick(member)}
                                                    className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all hover:scale-105 active:scale-95 ${activeTab === 'expiring'
                                                        ? 'bg-amber-500 text-white shadow-amber-100 hover:shadow-amber-200'
                                                        : 'bg-rose-600 text-white shadow-rose-100 hover:shadow-rose-200'
                                                        }`}
                                                >
                                                    Renew Membership
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                <RefreshCw size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No members in this category</h3>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile List View */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-500">
                                        <RefreshCw size={24} className="animate-spin" />
                                    </div>
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : filteredMembers.length > 0 ? filteredMembers.map(member => (
                                <div key={member.id} className="p-6 space-y-5">
                                    {/* ... mobile record content ... */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${activeTab === 'expiring' ? 'bg-amber-500' : 'bg-rose-600'}`}>
                                                {member.memberName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight">{member.memberName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{member.planName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${activeTab === 'expiring' ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {activeTab === 'expiring' ? `${getDaysDiff(member.endDate)}d` : `${Math.abs(getDaysDiff(member.endDate))}d`}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                                                {activeTab === 'expiring' ? 'Left' : 'Ago'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCallMember(member)}
                                            className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 active:bg-slate-100 transition-colors"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleMessageMember(member)}
                                            className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 active:bg-slate-100 transition-colors"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleRenewClick(member)}
                                            className={`flex-[3] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all active:scale-95 ${activeTab === 'expiring' ? 'bg-amber-500 shadow-amber-100' : 'bg-rose-600 shadow-rose-100'
                                                }`}
                                        >
                                            Renew
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center">
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No records found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Renewal Modal */}
            <RenewalModal
                isOpen={isRenewalModalOpen}
                onClose={() => setIsRenewalModalOpen(false)}
                member={selectedMember}
            />
        </div>
    );
};

export default RenewalAlertsPage;
