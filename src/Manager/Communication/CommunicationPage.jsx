import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, Image, Paperclip, MoreVertical, CheckCheck, Smile, Phone, Video, Info, User, Plus, Sparkles, RefreshCw, ChevronLeft } from 'lucide-react';
import { fetchChatContacts, fetchChatMessages, sendChatMessage } from '../../api/communication/communicationApi';
import toast from 'react-hot-toast';

import Announcements from './Announcements';
import Birthdays from './Birthdays';

const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
};

const S = {
  ff: "'Plus Jakarta Sans', sans-serif",
  card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(124,92,252,0.05)', transition: 'all 0.3s ease' },
  input: { width: '100%', height: 48, borderRadius: 14, border: `2px solid ${T.border}`, background: T.bg, padding: '0 16px', fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s' }
};

const CommunicationPage = ({ initialModule = 'chats' }) => {
    const [activeModule, setActiveModule] = useState(initialModule);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [msgInput, setMsgInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [view, setView] = useState('list');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const fetchChats = async () => {
            try { const data = await fetchChatContacts(); setChats(data); } catch (error) { console.error("Failed to load chats:", error); }
        };
        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchMsgs = async () => {
            if (!selectedChat) return;
            try {
                const msgs = await fetchChatMessages(selectedChat.id, !selectedChat.isStaff);
                setMessages(msgs.map(m => ({
                    id: m.id, text: m.message, time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: m.senderId === JSON.parse(localStorage.getItem('userData'))?.id ? 'me' : 'them',
                    status: m.isRead ? 'read' : 'sent', attachmentUrl: m.attachmentUrl, attachmentType: m.attachmentType
                })));
            } catch (error) { console.error("Failed to load messages:", error); }
        };
        fetchMsgs();
        const interval = setInterval(fetchMsgs, 3000);
        return () => clearInterval(interval);
    }, [selectedChat]);

    const handleSend = async () => {
        if ((!msgInput.trim() && !selectedFile) || !selectedChat) return;
        try {
            const payload = { receiverId: selectedChat.id, message: msgInput, receiverType: selectedChat.isStaff ? 'STAFF' : 'MEMBER' };
            if (selectedFile) { payload.attachmentUrl = selectedFile.data; payload.attachmentType = selectedFile.type.startsWith('image/') ? 'image' : 'file'; }
            await sendChatMessage(payload);
            setMsgInput(''); setSelectedFile(null);
        } catch (error) { toast.error("Failed to send message"); }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || (activeTab === 'Unread' && chat.unread > 0);
        return matchesSearch && matchesTab;
    });

    return (
        <div style={{ background: T.bg, height: 'calc(100vh - 40px)', padding: '20px 24px', fontFamily: S.ff, display: 'flex', flexDirection: 'column' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                .fu { animation: fadeUp 0.3s ease both }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${T.accentMid}; border-radius: 10px; }
            `}</style>

            <div className="fu" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #7C5CFC, #9B7BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(124,92,252,0.2)' }}><MessageSquare size={20} /></div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>Communication Hub</h1>
                        <p style={{ fontSize: 11, color: T.muted, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time interaction with staff & members</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, background: 'white', padding: 4, borderRadius: 12, border: `1px solid ${T.border}` }}>
                    {['chats', 'announcements', 'birthdays'].map(mod => (
                        <button key={mod} onClick={() => setActiveModule(mod)} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: activeModule === mod ? T.accent : 'transparent', color: activeModule === mod ? 'white' : T.muted, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>{mod}</button>
                    ))}
                </div>
            </div>

            <div className="fu" style={{ flex: 1, display: 'flex', background: 'white', borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                {activeModule === 'announcements' ? <div style={{ flex: 1, display: 'flex' }}><Announcements /></div> : activeModule === 'birthdays' ? <div style={{ flex: 1, display: 'flex' }}><Birthdays /></div> : (
                    <>
                        {/* Sidebar */}
                        <div style={{ width: 340, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: 24, paddingBottom: 16 }}>
                                <div style={{ position: 'relative', marginBottom: 20 }}>
                                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                                    <input style={{ ...S.input, paddingLeft: 44, height: 44, borderRadius: 12 }} placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: 20, borderBottom: `1px solid ${T.bg}` }}>
                                    {['All', 'Unread'].map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ paddingBottom: 12, background: 'none', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: activeTab === tab ? T.accent : T.muted, position: 'relative', cursor: 'pointer' }}>
                                            {tab}
                                            {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: T.accent, borderRadius: 2 }}></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
                                {filteredChats.map(chat => (
                                    <div key={chat.id} onClick={() => setSelectedChat(chat)} style={{ padding: 12, borderRadius: 16, cursor: 'pointer', background: selectedChat?.id === chat.id ? T.accentLight : 'transparent', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, transition: 'all 0.2s' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: T.accent, border: `2px solid ${T.surface}`, overflow: 'hidden' }}>
                                            {chat.avatar ? <img src={chat.avatar} style={{ width: '100%', height: '100%', objectCover: 'cover' }} /> : chat.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontWeight: 800, fontSize: 14, color: T.text, truncate: 'true' }}>{chat.name}</div>
                                                <div style={{ fontSize: 10, color: T.subtle }}>{chat.time}</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                                <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMsg || 'No messages yet'}</div>
                                                {chat.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.accent, color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{chat.unread}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }}>
                            {selectedChat ? (
                                <>
                                    <div style={{ padding: '16px 24px', background: 'white', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontWeight: 800 }}>{selectedChat.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 900, fontSize: 15, color: T.text }}>{selectedChat.name}</div>
                                                <div style={{ fontSize: 11, color: T.green, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }}></div> Online Now</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {messages.map(m => (
                                            <div key={m.id} style={{ alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start', maxWidth: '70%', background: m.sender === 'me' ? T.accent : 'white', color: m.sender === 'me' ? 'white' : T.text, padding: '12px 18px', borderRadius: m.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: '1.4' }}>{m.text}</div>
                                                <div style={{ fontSize: 9, opacity: 0.7, textAlign: 'right', fontWeight: 800 }}>{m.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: 24, background: 'white', borderTop: `1px solid ${T.border}` }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: T.bg, padding: 8, borderRadius: 18, border: `1px solid ${T.border}` }}>
                                            <input style={{ ...S.input, background: 'transparent', border: 'none', height: 40 }} placeholder="Type your message..." value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                                            <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: 14, background: T.accent, color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(124,92,252,0.2)' }}><Send size={18} /></button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                    <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>Select a chat to start messaging</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunicationPage;
