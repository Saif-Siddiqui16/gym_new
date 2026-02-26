import React, { useState, useEffect, useRef } from 'react';
import { Search, QrCode, User, Calendar, AlertCircle, CheckCircle, ScanLine, X } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { searchMember, checkInMember, getMemberSuggestions } from '../../api/staff/memberCheckInApi';

const MemberCheckIn = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [foundMember, setFoundMember] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length >= 2) {
                const results = await getMemberSuggestions(searchQuery);
                setSuggestions(results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectMember = async (member) => {
        setFoundMember(member);
        setIsExpired(member.status === 'Expired');
        setSearchQuery(member.name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const member = await searchMember(searchQuery);
        if (member) {
            setFoundMember(member);
            setIsExpired(member.status === 'Expired');
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
            setFoundMember(null);
            alert("No member found");
        }
    };

    const handleCheckIn = async () => {
        if (foundMember) {
            const result = await checkInMember(foundMember.id, foundMember.isStaffUser);
            if (result.success) {
                alert(result.message);
                setFoundMember(null);
                setSearchQuery('');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <QrCode size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Member Check-In
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">Search or scan member to grant access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Search Card */}
                <div className="group relative bg-white rounded-[32px] shadow-xl border border-slate-100 hover:shadow-2xl hover:border-violet-100 transition-all duration-300 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 p-8">
                        <div className="relative" ref={searchRef}>
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="relative flex-1 group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search size={20} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by Name, ID, or Phone..."
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchQuery(''); setFoundMember(null); }}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300">
                                    Search
                                </button>
                            </form>

                            {/* Premium Suggestions Dropdown - Increased Width & Visibility */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full -left-4 -right-4 mt-4 bg-white/98 backdrop-blur-xl border border-slate-200/80 rounded-[32px] shadow-[0_30px_70px_rgba(15,23,42,0.18)] z-[200] animate-in slide-in-from-top-6 duration-500 ring-8 ring-slate-100/40">
                                    <div className="max-h-[500px] overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {suggestions.map((member) => (
                                            <button
                                                key={`${member.type}-${member.id}`}
                                                onClick={() => handleSelectMember(member)}
                                                className="w-full px-6 py-5 text-left hover:bg-violet-50/90 rounded-[24px] transition-all duration-300 flex items-center justify-between group border border-transparent hover:border-violet-100/50 hover:shadow-sm"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`h-16 w-16 rounded-[22px] flex items-center justify-center font-black text-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${member.type === 'Staff'
                                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-300/40'
                                                            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-300/40'
                                                        }`}>
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-violet-700 transition-colors capitalize leading-tight mb-1.5">
                                                            {member.name.toLowerCase()}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                ID: {member.memberId || member.id}
                                                            </div>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                                                                {member.phone || member.email || 'No contact info'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2.5">
                                                    <div className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${member.status === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100/50'
                                                        }`}>
                                                        {member.status}
                                                    </div>
                                                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${member.type === 'Staff'
                                                            ? 'bg-slate-900 text-amber-400'
                                                            : 'bg-slate-900 text-violet-400'
                                                        }`}>
                                                        {member.type}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50/80 p-4 border-t border-slate-100/60 flex justify-center items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:-0.3s]"></div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Profile to Check-In</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex items-center justify-center">
                            <span className="text-xs font-black text-slate-400 px-4 bg-white relative z-10 uppercase tracking-widest">OR</span>
                            <div className="absolute w-full h-px bg-slate-100 left-0"></div>
                        </div>

                        <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-3 text-slate-500 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 transition-all duration-300 group/scan">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover/scan:bg-white group-hover/scan:text-violet-600 transition-colors">
                                <ScanLine size={24} />
                            </div>
                            <span className="font-bold">Scan QR / Barcode</span>
                        </button>
                    </div>
                </div>

                {/* Member Result Card */}
                {foundMember && (
                    <div className={`relative p-8 rounded-3xl shadow-2xl border-2 overflow-hidden transition-all duration-500 animate-in zoom-in-95 ${isExpired ? 'bg-white border-red-200 shadow-red-100' : 'bg-white border-emerald-200 shadow-emerald-100'
                        }`}>
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isExpired ? 'bg-red-500' : 'bg-emerald-500'
                            }`}></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl transform hover:scale-105 transition-transform duration-300 ${isExpired
                                ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 shadow-red-200'
                                : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-emerald-200'
                                }`}>
                                {(foundMember?.name || '?').charAt(0)}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{foundMember.name}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                            <User size={14} />
                                            {foundMember.id}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${isExpired
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            {foundMember.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiration</div>
                                        <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-violet-500" />
                                            {foundMember.expiry}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan</div>
                                        <div className="text-sm font-bold text-slate-800">Premium Annual</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isExpired ? (
                            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                                    <AlertCircle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm mb-1">Membership Expired</h4>
                                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                                        This member's plan expired on {foundMember.expiry}. Please request renewal before granting entry.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleCheckIn}
                                    className="w-full h-16 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 text-lg font-black tracking-wide uppercase flex items-center justify-center gap-3 active:scale-95 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <CheckCircle size={28} strokeWidth={3} />
                                    Check In Now
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberCheckIn;
