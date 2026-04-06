import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, MoreVertical, Eye, MessageSquare, ChevronLeft, ChevronRight, 
    User, Trophy, Calendar, ArrowUpRight, X, Send, Phone, Info, Trash2, 
    ShieldAlert, Clock, ClipboardList, TrendingUp, Shield, Activity, Star, ArrowRight, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssignedMembers, flagMember } from '../../api/trainer/trainerApi';
import { toast } from 'react-hot-toast';
import { sendChatMessage, getChatMessages } from '../../api/communication/communicationApi';
import CustomDropdown from '../../components/common/CustomDropdown';

import ActionDropdown from '../../components/common/ActionDropdown';
import MemberProfileView from './MemberProfileView';
import RightDrawer from '../../components/common/RightDrawer';
import QuickAssignPlanDrawer from './components/QuickAssignPlanDrawer';

import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
   ───────────────────────────────────────────────────────────────────────────── */
const T = {
    accent: '#7C5CFC',        // primary purple
    accent2: '#9B7BFF',       // lighter purple
    accentLight: '#F0ECFF',   // purple tint bg
    accentMid: '#E4DCFF',     // purple border/focus
    border: '#EAE7FF',        // default borders
    bg: '#F6F5FF',            // page background
    surface: '#FFFFFF',       // card/input surface
    text: '#1A1533',          // primary text
    muted: '#7B7A8E',         // secondary text
    subtle: '#B0ADCC',        // placeholder / hints
    green: '#22C97A',         // success
    greenLight: '#E8FBF2',
    amber: '#F59E0B',         // warning
    amberLight: '#FEF3C7',
    rose: '#F43F5E',          // danger
    roseLight: '#FFF1F4',
    blue: '#3B82F6',          // info
    blueLight: '#EFF6FF',
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

const AssignedMembers = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [totalItems, setTotalItems] = useState(0);

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [flagReason, setFlagReason] = useState('');

    useEffect(() => { loadMembers(); }, [searchTerm, statusFilter, currentPage, itemsPerPage, selectedBranch]);

    useEffect(() => {
        let pollInterval;
        if (isChatModalOpen && selectedMember) {
            loadChatHistory();
            pollInterval = setInterval(loadChatHistory, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [isChatModalOpen, selectedMember]);

    const loadChatHistory = async () => {
        if (!selectedMember) return;
        try {
            const messages = await getChatMessages(selectedMember.id, true);
            setChatHistory(messages);
        } catch (error) { console.error(error); }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim() || !selectedMember) return;
        const msg = chatMessage; setChatMessage('');
        try {
            await sendChatMessage({ receiverId: selectedMember.id, message: msg, receiverType: 'MEMBER' });
            loadChatHistory();
        } catch (error) { toast.error('Failed to send message'); }
    };

    const loadMembers = async () => {
        setLoading(true);
        try {
            const result = await getAssignedMembers({
                filters: { search: searchTerm, status: statusFilter === 'All' ? '' : statusFilter },
                page: currentPage, limit: itemsPerPage, branchId: selectedBranch
            });
            setMembers(result?.data || []);
            setTotalItems(result?.total || 0);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; } .fu4 { animation-delay: .2s; }
                
                .grid-row {
                    display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 180px; 
                    padding: 16px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s;
                }
                .grid-row:hover { background: ${T.bg}; }
                .grid-header {
                    display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 180px;
                    padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent};
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                }
            `}</style>

            <HeaderBanner 
                title="Assigned Members" 
                sub={`Managing ${totalItems} elite athletes in your roster`} 
                icon={Users}
                actions={
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>LIVE ROSTER</span>
                    </div>
                }
            />

            {/* Filters Area */}
            <div className="fu fu2" style={{ display: 'flex', gap: 16, marginBottom: 24, background: T.surface, padding: 16, borderRadius: 20, border: `1px solid ${T.border}` }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" placeholder="Search by name, ID or plan..." 
                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none' }}
                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <CustomDropdown 
                    options={[{ value: 'All', label: 'All Status' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
                    value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                    style={{ width: 180 }}
                />
            </div>

            {/* Table Area */}
            <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {loading ? (
                    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: T.accent, borderTopColor: 'transparent' }} />
                        <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Analyzing Roster...</p>
                    </div>
                ) : members.length > 0 ? (
                    <>
                        <div className="grid-header">
                            {['Member Details', 'Active Plan', 'Attendance', 'Status', 'Actions'].map(h => <span key={h}>{h}</span>)}
                        </div>
                        {members.map((member, i) => (
                            <div key={member.id} className="grid-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: i % 2 === 0 ? T.accent : T.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                                        {member.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{member.name}</div>
                                        <div style={{ fontSize: 10, color: T.subtle, fontWeight: 700 }}>REF: #{member.id}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={14} /></div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{member.assignedProtocol !== 'None' ? member.assignedProtocol : (member.plan || 'No Active Plan')}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{member.attendance}</span>
                                        <span style={{ fontSize: 9, fontWeight: 800, color: T.green, background: T.greenLight, padding: '2px 6px', borderRadius: 6 }}>+2%</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, background: member.status?.toLowerCase() === 'active' ? T.greenLight : T.roseLight, color: member.status?.toLowerCase() === 'active' ? T.green : T.rose }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: member.status?.toLowerCase() === 'active' ? T.green : T.rose }} />
                                        {member.status}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                    <button 
                                        onClick={() => { setSelectedMember(member); setIsAssignOpen(true); }}
                                        style={{ background: T.accent, border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,252,0.2)' }}
                                    >Assign Plan</button>
                                    <ActionDropdown trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.subtle }}><MoreVertical size={20} /></button>}>
                                        <button onClick={() => { setSelectedMember(member); setIsProfileModalOpen(true); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.text }}><Eye size={14} /> Profile View</button>
                                        <button onClick={() => { setSelectedMember(member); setIsChatModalOpen(true); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.text }}><MessageSquare size={14} /> Send Message</button>
                                        <button onClick={() => { setSelectedMember(member); setIsAttendanceModalOpen(true); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.text }}><Calendar size={14} /> Attendance</button>
                                        <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
                                        <button onClick={() => { setSelectedMember(member); setIsFlagModalOpen(true); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.rose }}><ShieldAlert size={14} /> Flag Member</button>
                                    </ActionDropdown>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.subtle }}><User size={32} /></div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>No members found</h3>
                        <p style={{ fontSize: 13, color: T.muted }}>Adjust your filters or try a different search</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalItems > 0 && (
                <div className="fu fu4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, background: T.surface, padding: '12px 24px', borderRadius: 18, border: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Roster <span style={{ color: T.text }}>{((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}</span> of {totalItems}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', opacity: currentPage >= Math.ceil(totalItems / itemsPerPage) ? 0.4 : 1 }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            )}

            {/* Modals & Drawers */}
            <RightDrawer isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} title={`DM: ${selectedMember?.name}`} maxWidth="max-w-md">
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, padding: 20 }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="custom-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{ alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', borderRadius: 16, background: msg.senderId === user?.id ? T.accent : T.surface, color: msg.senderId === user?.id ? '#fff' : T.text, fontSize: 13, fontWeight: 500, border: msg.senderId === user?.id ? 'none' : `1px solid ${T.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                        <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type message..." style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, outline: 'none', fontSize: 13, fontWeight: 600 }} />
                        <button type="submit" style={{ width: 44, height: 44, borderRadius: 12, background: T.accent, color: '#fff', border: 'none', cursor: 'pointer' }}><Send size={18} /></button>
                    </form>
                </div>
            </RightDrawer>

            <RightDrawer isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Attendance Log" maxWidth="max-w-lg">
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(selectedMember?.recentWorkouts || []).length > 0 ? selectedMember.recentWorkouts.map((log, i) => (
                        <div key={i} style={{ padding: 16, background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} /></div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{log.date}</div>
                                    <div style={{ fontSize: 10, color: T.subtle, fontWeight: 800 }}>{log.time} • {log.type}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: T.green }}>{log.status}</span>
                        </div>
                    )) : <p style={{ textAlign: 'center', color: T.subtle, fontSize: 12 }}>No logs recorded</p>}
                </div>
            </RightDrawer>

            <RightDrawer isOpen={isFlagModalOpen} onClose={() => setIsFlagModalOpen(false)} title="Flag Status" maxWidth="max-w-md">
                <div style={{ padding: 24 }}>
                    <p style={{ fontSize: 13, color: T.muted, marginBottom: 20, fontWeight: 600 }}>Adding a flag warns the administration team about this member's conduct or pending issues.</p>
                    <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Provide detailed reason..." style={{ width: '100%', height: 120, padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg, outline: 'none', fontSize: 13, fontWeight: 600, resize: 'none' }} />
                    <button 
                        onClick={async () => { await flagMember(selectedMember.id, flagReason); setFlagReason(''); setIsFlagModalOpen(false); loadMembers(); }}
                        style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 14, background: T.rose, color: '#fff', border: 'none', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(244,63,94,0.2)' }}
                    >Flag Systemic Alert</button>
                </div>
            </RightDrawer>

            <RightDrawer isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Athlete Profile" maxWidth="max-w-full">
                {selectedMember && <MemberProfileView memberId={selectedMember.id} onClose={() => setIsProfileModalOpen(false)} />}
            </RightDrawer>

            <QuickAssignPlanDrawer isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} memberName={selectedMember?.name} memberId={selectedMember?.id} onSuccess={loadMembers} />
        </div>
    );
};

export default AssignedMembers;
