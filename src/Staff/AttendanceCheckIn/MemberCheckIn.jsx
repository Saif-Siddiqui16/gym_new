import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Calendar, AlertCircle, CheckCircle, X, Phone, CreditCard } from 'lucide-react';
import { searchMember, checkInMember, getMemberSuggestions } from '../../api/staff/memberCheckInApi';
import toast from 'react-hot-toast';

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
        setIsExpired(member.personType === 'Member' && member.status === 'Expired');
        setSearchQuery(member.name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearch = async (e, providedQuery) => {
        if (e) e.preventDefault();
        const query = providedQuery || searchQuery;
        if (!query) return;

        const result = await searchMember(query);
        if (result) {
            setFoundMember(result);
            setIsExpired(result.personType === 'Member' && result.status !== 'Active');
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
            setFoundMember(null);
            toast.error('No one found with this code/name/phone');
        }
    };

    const handleCheckIn = async () => {
        if (foundMember) {
            // checkInPayload contains { memberId: id, type: 'Member' } or { userId: id, type: 'Trainer' }
            const result = await checkInMember(foundMember.checkInPayload);
            if (result.success) {
                toast.success(`${foundMember.personType} ${foundMember.name} checked in successfully!`);
                setFoundMember(null);
                setSearchQuery('');
            } else {
                toast.error(result.message || 'Check-in failed');
            }
        }
    };

    return (
        <div className="min-h-screen animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-2 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <User size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                        Quick Check-In
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-primary text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">Search Member/Trainer/Staff to grant access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Search Card */}
                <div className="group relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-100 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 p-5 sm:p-8">
                        <div className="relative mb-4" ref={searchRef}>
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="relative flex-1 group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search size={20} className="text-slate-400 group-focus-within/input:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by Name, Code, or Phone..."
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
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
                                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-primary to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30/30 hover:shadow-xl hover:shadow-primary/30/40 hover:scale-105 transition-all duration-300">
                                    Search
                                </button>
                            </form>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                                    {suggestions.map((m) => (
                                        <button
                                            key={m.id + m.personType}
                                            onClick={() => handleSelectMember(m)}
                                            className="w-full px-4 py-3 text-left hover:bg-primary-light transition-colors flex items-center justify-between group border-b border-slate-50 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-violet-100 text-primary flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{m.name} <span className="text-[10px] text-primary ml-1">({m.personType})</span></p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{m.code} • {m.phone}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {m.status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Member Result Card */}
                {foundMember && (
                    <div className={`relative p-5 sm:p-8 rounded-3xl shadow-2xl border-2 overflow-hidden transition-all duration-500 animate-in zoom-in-95 ${isExpired ? 'bg-white border-red-200 shadow-red-100' : 'bg-white border-emerald-200 shadow-emerald-100'
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
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                            {foundMember.personType}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                            <User size={14} />
                                            {foundMember.code}
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
                                    {foundMember.personType === 'Member' && (
                                        <>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiration</div>
                                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-primary" />
                                                    {foundMember.expiryDate ? new Date(foundMember.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry'}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan</div>
                                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    <CreditCard size={14} className="text-primary" />
                                                    {foundMember.planName || 'No Plan'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {foundMember.phone && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</div>
                                            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                <Phone size={14} className="text-primary" />
                                                {foundMember.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isExpired ? (
                            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                                    <AlertCircle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm mb-1">Access Restricted</h4>
                                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                                        This {foundMember.personType}'s status is <strong>{foundMember.status}</strong>.
                                        Please ensure status is Active before granting entry.
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
