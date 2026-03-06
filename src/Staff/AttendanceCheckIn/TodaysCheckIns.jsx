import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, Search, Maximize, ArrowUpRight, ArrowDownLeft, UserCircle, CheckCircle, XCircle, Loader2, Scan, ChevronRight, Camera, CameraOff, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../../styles/GlobalDesign.css';
import { getTodaysCheckIns, searchMember, checkInMember, checkOutMember, getMemberSuggestions } from '../../api/staff/memberCheckInApi';
import toast from 'react-hot-toast';

const TodaysCheckIns = () => {
    const [activeTab, setActiveTab] = useState('currentlyIn');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState({ currentlyIn: [], history: [], stats: { total: 0, inside: 0, checkedOut: 0 } });
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const searchRef = useRef(null);
    const scannerRef = useRef(null);

    const fetchData = async () => {
        try {
            const data = await getTodaysCheckIns();
            setAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let sc = null;
        const initScanner = async () => {
            if (isScanning) {
                // Small delay to ensure DOM is ready
                await new Promise(r => setTimeout(r, 100));
                const element = document.getElementById('reader');
                if (element) {
                    sc = new Html5QrcodeScanner('reader', {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                    });
                    sc.render(onScanSuccess, onScanError);
                }
            }
        };

        initScanner();

        return () => {
            if (sc) {
                sc.clear().catch(err => console.error("Failed to clear scanner:", err));
            }
        };
    }, [isScanning]);

    const onScanSuccess = (decodedText) => {
        setIsScanning(false);
        setSearchTerm(decodedText);
        handleSearchSubmit(null, decodedText);
    };

    const onScanError = (err) => {
        // console.warn(err);
    };

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
            if (searchTerm.length >= 2) {
                try {
                    const results = await getMemberSuggestions(searchTerm);
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Suggestion error:', error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleCheckIn = async (memberId) => {
        setProcessingId(memberId);
        try {
            const result = await checkInMember(memberId);
            if (result.success) {
                toast.success(result.message || 'Member checked in!');
                fetchData();
                setSearchTerm('');
                setShowSuggestions(false);
            } else {
                toast.error(result.message || 'Check-in failed');
            }
        } catch (error) {
            toast.error('Check-in failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCheckOut = async (memberId) => {
        setProcessingId(memberId);
        try {
            const result = await checkOutMember(memberId);
            if (result.success) {
                toast.success('Member checked out!');
                fetchData();
            } else {
                toast.error(result.message || 'Check-out failed');
            }
        } catch (error) {
            toast.error('Check-out failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSearchSubmit = async (e, providedCode) => {
        if (e) e.preventDefault();
        const codeToSearch = providedCode || searchTerm;
        if (!codeToSearch) return;

        try {
            const member = await searchMember(codeToSearch);
            if (member) {
                handleCheckIn(member.id);
            } else {
                toast.error('No member found with this code/details');
            }
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const displayList =
        activeTab === 'currentlyIn' ? attendanceData.currentlyIn :
            activeTab === 'absent' ? (attendanceData.absent || []) :
                attendanceData.history;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-0 md:p-8 space-y-6 animate-fadeIn">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-violet-600">
                        <Scan size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Quick check-in / check-out</p>
                    </div>
                </div>

                {/* Header Stats */}
                <div className="flex items-center gap-3 md:gap-6 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                        <span className="text-sm font-bold text-slate-900">{attendanceData.stats.inside} <span className="text-slate-400 font-medium tracking-normal">In</span></span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2 text-emerald-600">
                        <ArrowDownLeft size={16} />
                        <span className="text-sm font-bold">{attendanceData.stats.total} <span className="text-slate-400 font-medium ml-1 tracking-normal">Today</span></span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2 text-rose-500">
                        <ArrowUpRight size={16} />
                        <span className="text-sm font-bold">{attendanceData.stats.checkedOut} <span className="text-slate-400 font-medium ml-1 tracking-normal">Out</span></span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <XCircle size={16} />
                        <span className="text-sm font-bold">{attendanceData.stats.absent || 0} <span className="text-slate-400 font-medium ml-1 tracking-normal">Absent</span></span>
                    </div>
                </div>
            </div>

            {/* Search Bar Section */}
            <div className="flex flex-col gap-4">
                {isScanning && (
                    <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-violet-500/20 max-w-lg mx-auto w-full animate-in zoom-in-95 duration-300">
                        <div id="reader" className="w-full"></div>
                        <button
                            onClick={() => setIsScanning(false)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all z-50"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-6 left-0 right-0 text-center z-50">
                            <span className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                Align Barcode / QR Code within the box
                            </span>
                        </div>
                    </div>
                )}

                <div className="relative group w-full" ref={searchRef}>
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-violet-500 transition-colors">
                        <Search size={22} />
                    </div>
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Scan barcode or type member code / name / phone..."
                            className="w-full h-16 pl-14 pr-48 rounded-[1.25rem] bg-white border-2 border-slate-100 text-sm font-semibold placeholder:text-slate-300 focus:border-violet-500 focus:ring-8 focus:ring-violet-500/5 transition-all outline-none shadow-sm"
                            autoFocus
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsScanning(!isScanning)}
                                className={`h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isScanning ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                {isScanning ? <CameraOff size={14} /> : <Camera size={14} />}
                                <span className="hidden sm:inline">{isScanning ? 'Stop' : 'Scan'}</span>
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Search size={14} /> <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 ring-4 ring-slate-900/5">
                            {suggestions.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => handleCheckIn(member.id)}
                                    disabled={processingId === member.id}
                                    className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{member.memberId || member.id} • {member.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {member.status}
                                        </span>
                                        {processingId === member.id ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 transition-colors" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="p-2 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab('currentlyIn')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'currentlyIn' ? 'bg-white text-violet-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Users size={16} /> Currently In ({attendanceData.stats.inside})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-violet-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Clock size={16} /> Today's Log ({attendanceData.stats.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('absent')}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'absent' ? 'bg-white text-violet-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <XCircle size={16} /> Absent ({attendanceData.stats.absent || 0})
                        </button>
                    </div>

                    {loading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                        </div>
                    ) : displayList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {displayList.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                        {log.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{log.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.plan}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-500">{log.code}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    {log.status === 'Absent' ? (
                                                        <span className="text-xs font-bold text-slate-400 italic">No entry</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs font-bold text-slate-900">{log.in}</span>
                                                            {log.out !== '-' && <span className="text-[10px] text-rose-400 font-bold">Out: {log.out}</span>}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-900">{log.duration || '-'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {log.status === 'Inside' ? (
                                                    <button
                                                        onClick={() => handleCheckOut(log.memberId)}
                                                        disabled={processingId === log.memberId}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {processingId === log.memberId ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />}
                                                        Check Out
                                                    </button>
                                                ) : log.status === 'Absent' ? (
                                                    <button
                                                        onClick={() => handleCheckIn(log.memberId)}
                                                        disabled={processingId === log.memberId}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {processingId === log.memberId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        Check In
                                                    </button>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle size={12} /> Completed
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-20 animate-fadeIn">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center text-slate-200">
                                    {activeTab === 'currentlyIn' ? (
                                        <UserCircle size={64} className="text-slate-300" />
                                    ) : (
                                        <Clock size={64} className="text-slate-300" />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                {activeTab === 'currentlyIn'
                                    ? "No members currently checked in"
                                    : "No attendance records for today"}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-4 max-w-xs leading-relaxed opacity-70">
                                {activeTab === 'currentlyIn'
                                    ? "Scan a barcode or search to record a new check-in"
                                    : "Attendance logs will appear here once members start checking in"}
                            </p>

                            <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodaysCheckIns;
