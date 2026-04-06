import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Clock, Search, Maximize, ArrowUpRight, ArrowDownLeft, UserCircle,
    CheckCircle, XCircle, Loader2, Scan, ChevronRight, Camera, CameraOff, X,
    History, FileText, Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getTodaysCheckIns, searchMember, checkInMember, checkOutMember, getMemberSuggestions } from '../../api/staff/memberCheckInApi';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

const INPUT_STYLE = {
    width: '100%', height: 56, padding: '0 24px', borderRadius: 20, border: `2px solid ${T.border}`,
    background: '#FFFFFF', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
};

const TodaysCheckIns = () => {
    const [activeTab, setActiveTab] = useState('currentlyIn');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState({ currentlyIn: [], history: [], stats: { total: 0, inside: 0, checkedOut: 0 } });
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const [historyRecords, setHistoryRecords] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const searchRef = useRef(null);

    const fetchData = async () => {
        try {
            const data = await getTodaysCheckIns();
            setAttendanceData(data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const params = new URLSearchParams({ startDate, endDate });
            if (historySearch) params.append('search', historySearch);
            const res = await apiClient.get(`/staff/attendance/history?${params.toString()}`);
            setHistoryRecords(res.data.records || []);
        } catch (err) { toast.error('Failed to load history'); } 
        finally { setHistoryLoading(false); }
    }, [startDate, endDate, historySearch]);

    useEffect(() => {
        if (activeTab === 'attendanceHistory') fetchHistory();
    }, [activeTab, fetchHistory]);

    useEffect(() => {
        let sc = null;
        const initScanner = async () => {
            if (isScanning) {
                await new Promise(r => setTimeout(r, 100));
                const element = document.getElementById('reader');
                if (element) {
                    sc = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 });
                    sc.render(decodedText => {
                        setIsScanning(false);
                        setSearchTerm(decodedText);
                        handleSearchSubmit(null, decodedText);
                    }, () => { });
                }
            }
        };
        initScanner();
        return () => { if (sc) sc.clear().catch(() => { }); };
    }, [isScanning]);

    useEffect(() => {
        const handle = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    useEffect(() => {
        const fetch = async () => {
            if (searchTerm.length >= 2) {
                const results = await getMemberSuggestions(searchTerm);
                setSuggestions(results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };
        const t = setTimeout(fetch, 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const handleCheckIn = async (memberId) => {
        setProcessingId(memberId);
        try {
            const result = await checkInMember(memberId);
            if (result.success) {
                toast.success(result.message || 'Member checked in!');
                fetchData(); setSearchTerm(''); setShowSuggestions(false); setSelectedMember(null);
            } else { toast.error(result.message || 'Check-in failed'); }
        } catch { toast.error('Check-in failed'); } finally { setProcessingId(null); }
    };

    const handleCheckOut = async (memberId) => {
        setProcessingId(memberId);
        try {
            const result = await checkOutMember(memberId);
            if (result.success) { toast.success('Member checked out!'); fetchData(); }
        } catch { toast.error('Check-out failed'); } finally { setProcessingId(null); }
    };

    const handleSearchSubmit = async (e, providedCode) => {
        if (e) e.preventDefault();
        const code = providedCode || searchTerm;
        if (!code) return;
        try {
            const member = await searchMember(code);
            if (member) { setSelectedMember(member); setShowSuggestions(false); }
            else toast.error('No member found');
        } catch { toast.error('Search failed'); }
    };

    const displayList =
        activeTab === 'currentlyIn' ? attendanceData.currentlyIn :
            activeTab === 'absent' ? (attendanceData.absent || []) :
                attendanceData.history;

    const TabStats = ({ icon: Icon, label, value, color, bg }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: bg, borderRadius: 14, border: `1px solid ${color}15` }}>
            <Icon size={16} color={color} strokeWidth={2.5} />
            <div style={{ fontSize: 13, fontWeight: 900, color: color }}>{value} <span style={{ fontSize: 9, color: T.muted, fontWeight: 800, textTransform: 'uppercase', marginLeft: 4 }}>{label}</span></div>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both; }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 2 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scan size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Attendance</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: '4px 0 0', fontWeight: 600 }}>Quick check-in / check-out portal</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, zIndex: 2 }}>
                    <TabStats icon={UserCircle} label="Today" value={attendanceData.stats.total} color={T.accent} bg="#fff" />
                    <TabStats icon={ArrowDownLeft} label="In" value={attendanceData.stats.inside} color={T.green} bg="#fff" />
                    <TabStats icon={ArrowUpRight} label="Out" value={attendanceData.stats.checkedOut} color={T.rose} bg="#fff" />
                </div>
            </div>

            {/* QUICK CHECK-IN SEARCH */}
            {activeTab !== 'attendanceHistory' && (
                <div style={{ marginBottom: 32, animationDelay: '0.1s' }} className="fu">
                    <div style={{ position: 'relative' }} ref={searchRef}>
                        <Search size={24} color={T.accent} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)' }} />
                        <form onSubmit={handleSearchSubmit}>
                            <input 
                                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Scan barcode or type member ID / Name / Phone..."
                                style={{ ...INPUT_STYLE, paddingLeft: 64, paddingRight: 200 }}
                            />
                            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => setIsScanning(!isScanning)} style={{ height: 40, padding: '0 16px', borderRadius: 12, background: isScanning ? T.roseLight : T.bg, color: isScanning ? T.rose : T.muted, border: 'none', fontSize: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Camera size={16} /> {isScanning ? 'STOP' : 'SCAN'}
                                </button>
                                <button type="submit" style={{ height: 40, padding: '0 24px', borderRadius: 12, background: T.accent, color: '#fff', border: 'none', fontSize: 10, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 20px rgba(124,92,252,0.2)' }}>SEARCH</button>
                            </div>
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 12, background: '#fff', borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                {suggestions.map(member => (
                                    <button key={member.id} onClick={() => { setSelectedMember(member); setShowSuggestions(false); }} style={{ width: '100%', padding: '16px 24px', textAlign: 'left', border: 'none', background: 'none', borderBottom: `1px solid ${T.bg}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>{member.name[0]}</div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{member.name}</div>
                                                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>ID: {member.memberId || member.id}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} color={T.subtle} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedMember && (
                        <div style={{ marginTop: 24, background: '#F9F8FF', border: `2px solid ${T.accentMid}`, borderRadius: 24, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="fu">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>{selectedMember.name[0]}</div>
                                <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>{selectedMember.name}</h3>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: T.accent, background: T.accentLight, padding: '4px 10px', borderRadius: 8 }}>{selectedMember.memberId || 'MEM-XXX'}</span>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: T.green, background: T.greenLight, padding: '4px 10px', borderRadius: 8 }}>{selectedMember.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setSelectedMember(null)} style={{ height: 48, padding: '0 24px', borderRadius: 14, background: '#fff', border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>CANCEL</button>
                                <button onClick={() => handleCheckIn(selectedMember.id)} style={{ height: 48, padding: '0 32px', borderRadius: 14, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 25px rgba(124,92,252,0.2)' }}>
                                    <CheckCircle size={18} /> CHECK IN NOW
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT AREA */}
            <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }} className="fu">
                <div style={{ padding: 12, background: '#F9F8FF', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
                    {[
                        { id: 'currentlyIn', label: `Inside (${attendanceData.stats.inside})`, icon: Users },
                        { id: 'history', label: `Today's Log (${attendanceData.stats.total})`, icon: Clock },
                        { id: 'attendanceHistory', label: 'History & Report', icon: History }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 20px', borderRadius: 14, background: activeTab === tab.id ? '#fff' : 'transparent', border: activeTab === tab.id ? `1px solid ${T.border}` : 'none', color: activeTab === tab.id ? T.accent : T.muted, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                            <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: 0 }}>
                    {activeTab === 'attendanceHistory' ? (
                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...INPUT_STYLE, height: 48 }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...INPUT_STYLE, height: 48 }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Search Member</label>
                                    <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Name or ID..." style={{ ...INPUT_STYLE, height: 48 }} />
                                </div>
                                <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 10 }}>
                                    <button onClick={fetchHistory} style={{ flex: 1, height: 48, borderRadius: 14, background: T.accent, color: '#fff', border: 'none', fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>APPLY</button>
                                    <button style={{ width: 48, height: 48, borderRadius: 14, background: T.text, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Download size={18} /></button>
                                </div>
                            </div>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F9F8FF', borderBottom: `1px solid ${T.border}` }}>
                                        {['Member', 'Plan', 'Date', 'In', 'Out', 'Duration', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyRecords.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>{r.name[0]}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{r.name}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: T.muted }}>{r.plan}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: T.text }}>{r.date}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 900, color: T.green }}>{r.in}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 900, color: T.rose }}>{r.out}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: T.text }}>{r.duration}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: 10, fontWeight: 900, color: r.status === 'Inside' ? T.green : T.muted, background: r.status === 'Inside' ? T.greenLight : T.bg, padding: '4px 10px', borderRadius: 8 }}>{r.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F9F8FF', borderBottom: `1px solid ${T.border}` }}>
                                        {['Member', 'Check-in', 'Duration', 'Action'].map(h => (
                                            <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayList.length > 0 ? displayList.map((log, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>{log.name[0]}</div>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{log.name}</div>
                                                        <div style={{ fontSize: 10, color: T.muted, fontWeight: 800 }}>{log.plan}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{log.in}</div>
                                                {log.out !== '-' && <div style={{ fontSize: 10, fontWeight: 800, color: T.rose }}>Out: {log.out}</div>}
                                            </td>
                                            <td style={{ padding: '20px 32px', fontSize: 13, fontWeight: 800, color: T.text }}>{log.duration || '—'}</td>
                                            <td style={{ padding: '20px 32px' }}>
                                                {log.status === 'Inside' ? (
                                                    <button onClick={() => handleCheckOut(log.memberId)} style={{ padding: '8px 16px', borderRadius: 10, background: T.roseLight, color: T.rose, border: 'none', fontSize: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <XCircle size={14} /> CHECK OUT
                                                    </button>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.green }}>
                                                        <CheckCircle size={16} /> <span style={{ fontSize: 11, fontWeight: 900 }}>COMPLETED</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} style={{ padding: 100, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                                    <UserCircle size={64} color={T.bg} />
                                                    <div style={{ fontSize: 16, fontWeight: 800, color: T.subtle }}>No entries found for this view.</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodaysCheckIns;
